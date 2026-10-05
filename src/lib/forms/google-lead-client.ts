import { resourceDownloads } from '$lib/config/lead-capture';

const namespace = 'rover-lead-capture';
const timeoutMs = 30_000;
const unavailableMessage = 'We couldn’t save your details. Please try again.';

export type ResourceLeadInput = {
	name: string;
	email: string;
	jobTitle: string;
	company: string;
	phone: string;
	website: string;
	resourceId: string;
	pageUrl: string;
	requestId: string;
};

export type ResourceLeadResult =
	| { ok: true; downloadUrl: string; duplicate?: boolean }
	| {
			ok: false;
			error: string;
			fieldErrors?: Partial<Record<'name' | 'email' | 'jobTitle' | 'company' | 'phone', string>>;
	  };

type PendingSubmission = {
	resourceId: string;
	resolve: (result: ResourceLeadResult) => void;
	reject: (error: Error) => void;
	cleanup: () => void;
};

type Bridge = {
	endpoint: string;
	iframe: HTMLIFrameElement;
	channel: string;
	source?: Window;
	origin?: string;
	ready: Promise<void>;
	pending: Map<string, PendingSubmission>;
	destroy: () => void;
};

function isGoogleBridgeOrigin(origin: string) {
	try {
		const url = new URL(origin);
		return (
			url.protocol === 'https:' &&
			(url.hostname === 'script.googleusercontent.com' ||
				url.hostname.endsWith('.script.googleusercontent.com') ||
				/^n-[a-z0-9-]+-script\.googleusercontent\.com$/.test(url.hostname))
		);
	} catch {
		return false;
	}
}

function belongsToIframe(
	source: MessageEventSource | null,
	iframe: HTMLIFrameElement
): source is Window {
	if (!source || !iframe.contentWindow) return false;
	try {
		let current = source as Window;
		for (let depth = 0; depth < 8; depth += 1) {
			if (current === iframe.contentWindow) return true;
			const parent = current.parent;
			if (!parent || parent === current || parent === window) return false;
			current = parent;
		}
	} catch {
		return false;
	}
	return false;
}

function allowedDownloadUrl(value: unknown, resourceId: string) {
	if (typeof value !== 'string') throw new Error(unavailableMessage);
	const expectedUrl = resourceDownloads[resourceId];
	if (!expectedUrl) throw new Error(unavailableMessage);
	const expected = new URL(expectedUrl);
	const url = new URL(value);
	const expires = Number(url.searchParams.get('X-Amz-Expires'));
	const date = url.searchParams.get('X-Amz-Date') || '';
	const timestamp = /^\d{8}T\d{6}Z$/.test(date)
		? Date.parse(
				`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(9, 11)}:${date.slice(11, 13)}:${date.slice(13, 15)}Z`
			)
		: NaN;
	if (
		url.protocol !== 'https:' ||
		url.origin !== expected.origin ||
		url.pathname !== expected.pathname ||
		url.username ||
		url.password ||
		url.hash ||
		url.searchParams.get('X-Amz-Algorithm') !== 'AWS4-HMAC-SHA256' ||
		url.searchParams.get('X-Amz-SignedHeaders') !== 'host' ||
		!url.searchParams.get('X-Amz-Credential') ||
		!/^([a-f0-9]{64})$/.test(url.searchParams.get('X-Amz-Signature') || '') ||
		!Number.isInteger(expires) ||
		expires < 1 ||
		expires > 300 ||
		!Number.isFinite(timestamp) ||
		timestamp > Date.now() + 60_000 ||
		timestamp + expires * 1000 <= Date.now()
	) {
		throw new Error(unavailableMessage);
	}
	return url.href;
}

function readFieldErrors(value: unknown) {
	if (!value || typeof value !== 'object') return undefined;
	const errors: Partial<Record<'name' | 'email' | 'jobTitle' | 'company' | 'phone', string>> = {};
	for (const field of ['name', 'email', 'jobTitle', 'company', 'phone'] as const) {
		const message = (value as Record<string, unknown>)[field];
		if (typeof message === 'string' && message) errors[field] = message.slice(0, 300);
	}
	return errors;
}

function waitForReady(bridge: Bridge, signal: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		if (signal.aborted) {
			reject(new DOMException('The request was cancelled.', 'AbortError'));
			return;
		}
		const abort = () => reject(new DOMException('The request was cancelled.', 'AbortError'));
		signal.addEventListener('abort', abort, { once: true });
		bridge.ready.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
	});
}

/** A form owns its bridge, so retries reuse the handshake and navigation removes it. */
export function createResourceLeadClient() {
	let bridge: Bridge | undefined;

	function destroy() {
		bridge?.destroy();
		bridge = undefined;
	}

	function createBridge(endpoint: string): Bridge {
		const scriptUrl = new URL(endpoint);
		if (
			scriptUrl.protocol !== 'https:' ||
			scriptUrl.hostname !== 'script.google.com' ||
			!/^\/macros\/s\/[^/]+\/exec$/.test(scriptUrl.pathname)
		) {
			throw new Error(unavailableMessage);
		}

		const iframe = document.createElement('iframe');
		// Keep visitors' Google sessions out of this anonymous web-app bridge.
		// Set before navigation; unsupported browsers retain the normal iframe.
		if ('credentialless' in iframe) iframe.setAttribute('credentialless', '');
		iframe.title = 'Secure resource download';
		iframe.hidden = true;
		iframe.setAttribute('aria-hidden', 'true');
		const channel = crypto.randomUUID();
		scriptUrl.searchParams.set('siteOrigin', window.location.origin);
		scriptUrl.searchParams.set('channel', channel);
		let readyResolve: () => void = () => {};
		let readyReject: (error: Error) => void = () => {};
		let readySettled = false;
		let destroyed = false;
		const ready = new Promise<void>((resolve, reject) => {
			readyResolve = resolve;
			readyReject = reject;
		});
		const connection: Bridge = {
			endpoint,
			iframe,
			channel,
			ready,
			pending: new Map(),
			destroy: () => {
				if (destroyed) return;
				destroyed = true;
				clearTimeout(readyTimer);
				window.removeEventListener('message', receiveMessage);
				iframe.remove();
				if (!readySettled) {
					readySettled = true;
					readyReject(new Error(unavailableMessage));
				}
				for (const submission of connection.pending.values()) {
					submission.cleanup();
					submission.reject(new Error(unavailableMessage));
				}
				connection.pending.clear();
			}
		};

		function receiveMessage(event: MessageEvent) {
			const data: unknown = event.data;
			if (!data || typeof data !== 'object') return;
			const reply = data as Record<string, unknown>;
			if (reply.namespace !== namespace || reply.channel !== channel) return;
			if (reply.type === 'ready' && !readySettled) {
				if (!isGoogleBridgeOrigin(event.origin) || !belongsToIframe(event.source, iframe)) return;
				if (reply.formVersion !== 3) {
					connection.destroy();
					if (bridge === connection) bridge = undefined;
					return;
				}
				connection.source = event.source;
				connection.origin = event.origin;
				readySettled = true;
				clearTimeout(readyTimer);
				readyResolve();
				return;
			}
			if (event.source !== connection.source || event.origin !== connection.origin) return;
			if (typeof reply.requestId !== 'string') return;
			const pending = connection.pending.get(reply.requestId);
			if (!pending || !['result', 'failure'].includes(String(reply.type))) return;
			connection.pending.delete(reply.requestId);
			pending.cleanup();
			if (reply.type === 'failure') {
				pending.reject(new Error(unavailableMessage));
				return;
			}
			try {
				if (!reply.result || typeof reply.result !== 'object') throw new Error(unavailableMessage);
				const result = reply.result as Record<string, unknown>;
				if (result.ok === true) {
					pending.resolve({
						ok: true,
						downloadUrl: allowedDownloadUrl(result.downloadUrl, pending.resourceId),
						duplicate: result.duplicate === true
					});
				} else if (result.ok === false) {
					pending.resolve({
						ok: false,
						error:
							typeof result.error === 'string' && result.error
								? result.error.slice(0, 300)
								: unavailableMessage,
						fieldErrors: readFieldErrors(result.fieldErrors)
					});
				} else {
					throw new Error(unavailableMessage);
				}
			} catch {
				pending.reject(new Error(unavailableMessage));
			}
		}

		const readyTimer = setTimeout(() => {
			connection.destroy();
			if (bridge === connection) bridge = undefined;
		}, timeoutMs);
		window.addEventListener('message', receiveMessage);
		iframe.src = scriptUrl.href;
		document.body.append(iframe);
		return connection;
	}

	async function submit(endpoint: string, input: ResourceLeadInput, signal: AbortSignal) {
		if (!resourceDownloads[input.resourceId]) throw new Error(unavailableMessage);
		if (!bridge || bridge.endpoint !== endpoint) {
			destroy();
			bridge = createBridge(endpoint);
		}
		const connection = bridge;
		await waitForReady(connection, signal);
		if (signal.aborted) throw new DOMException('The request was cancelled.', 'AbortError');
		if (!connection.source || !connection.origin) throw new Error(unavailableMessage);
		const { requestId, ...payload } = input;
		return new Promise<ResourceLeadResult>((resolve, reject) => {
			const abort = () => {
				connection.pending.get(requestId)?.cleanup();
				connection.pending.delete(requestId);
				reject(new DOMException('The request was cancelled.', 'AbortError'));
			};
			const timer = setTimeout(() => {
				connection.pending.get(requestId)?.cleanup();
				connection.pending.delete(requestId);
				reject(new Error('This is taking longer than expected. Please try again.'));
			}, timeoutMs);
			connection.pending.set(requestId, {
				resourceId: input.resourceId,
				resolve,
				reject,
				cleanup: () => {
					clearTimeout(timer);
					signal.removeEventListener('abort', abort);
				}
			});
			signal.addEventListener('abort', abort, { once: true });
			try {
				connection.source!.postMessage(
					{ namespace, type: 'submit', channel: connection.channel, requestId, payload },
					connection.origin!
				);
			} catch {
				connection.pending.get(requestId)?.cleanup();
				connection.pending.delete(requestId);
				reject(new Error(unavailableMessage));
			}
		});
	}

	return { submit, destroy };
}
