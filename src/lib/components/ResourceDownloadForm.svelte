<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import Download from '@lucide/svelte/icons/download';
	import FileText from '@lucide/svelte/icons/file-text';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import CountryCodePicker from '$lib/components/CountryCodePicker.svelte';
	import { internationalPhone, nationalPhone, pastedPhoneCountry } from '$lib/forms/phone-number';
	import type { CountryCode } from 'libphonenumber-js';
	import { leadCaptureEndpoint } from '$lib/config/lead-capture';
	import { createResourceLeadClient } from '$lib/forms/google-lead-client';

	type Field = 'name' | 'email' | 'jobTitle' | 'company' | 'phone';
	type Phase = 'idle' | 'submitting' | 'success';

	let {
		resourceId,
		title = 'Get the detailed comparison PDF',
		description = 'Download the complete guide to share with your team and compare your options in detail.',
		endpoint = leadCaptureEndpoint
	}: {
		resourceId: string;
		title?: string;
		description?: string;
		endpoint?: string;
	} = $props();

	const fieldPrefix = $derived(`resource-${resourceId.replace(/[^a-zA-Z0-9_-]/g, '-')}`);
	const configured = $derived(Boolean(endpoint.trim()));
	let mounted = $state(false);
	let name = $state('');
	let email = $state('');
	let jobTitle = $state('');
	let company = $state('');
	let phone = $state('');
	let phoneCountry = $state<CountryCode>('US');
	let pageUrl = $state('');
	let website = $state('');
	let phase = $state<Phase>('idle');
	let fieldErrors = $state<Partial<Record<Field, string>>>({});
	let message = $state('');
	let downloadUrl = $state('');
	let activeRequest: AbortController | undefined;
	let previousSubmission = '';
	let requestId = '';
	const client = createResourceLeadClient();

	onMount(() => {
		pageUrl = window.location.origin + window.location.pathname;
		mounted = true;
	});

	onDestroy(() => {
		activeRequest?.abort();
		client.destroy();
	});

	function clearFieldError(field: Field) {
		if (fieldErrors[field]) {
			fieldErrors = { ...fieldErrors, [field]: undefined };
		}
		message = '';
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!configured || !mounted || phase === 'submitting') return;

		const formattedPhone = internationalPhone(phone, phoneCountry);
		if (!formattedPhone) {
			fieldErrors = {
				...fieldErrors,
				phone: 'Enter a valid phone number for the selected country.'
			};
			await tick();
			document.getElementById(`${fieldPrefix}-phone`)?.focus();
			return;
		}

		const values = {
			name: name.trim(),
			email: email.trim().toLowerCase(),
			jobTitle: jobTitle.trim(),
			company: company.trim(),
			phone: formattedPhone,
			website,
			resourceId,
			pageUrl
		};
		const signature = JSON.stringify(values);
		if (signature !== previousSubmission || !requestId) {
			requestId = crypto.randomUUID();
			previousSubmission = signature;
		}

		phase = 'submitting';
		fieldErrors = {};
		message = '';
		activeRequest = new AbortController();

		try {
			const result = await client.submit(endpoint, { ...values, requestId }, activeRequest.signal);
			if (!result.ok) {
				fieldErrors = result.fieldErrors ?? {};
				message = result.error || 'We couldn’t save your details. Please try again.';
				phase = 'idle';
				await tick();
				const firstInvalid = (['name', 'email', 'jobTitle', 'company', 'phone'] as Field[]).find(
					(field) => fieldErrors[field]
				);
				if (firstInvalid) {
					document.getElementById(`${fieldPrefix}-${firstInvalid}`)?.focus();
				}
				return;
			}

			downloadUrl = result.downloadUrl;
			phase = 'success';
			window.location.assign(downloadUrl);
		} catch (error) {
			if (activeRequest.signal.aborted) return;
			phase = 'idle';
			message =
				error instanceof Error && error.message
					? error.message
					: 'We couldn’t save your details. Please try again.';
		} finally {
			activeRequest = undefined;
		}
	}
</script>

<section
	class="resource-download border-border bg-card/70 rounded-2xl border p-6 sm:p-8"
	aria-labelledby="{fieldPrefix}-heading"
>
	<div class="bg-primary/10 text-primary mb-5 inline-flex rounded-xl p-3" aria-hidden="true">
		<FileText class="h-6 w-6" />
	</div>
	<h2
		id="{fieldPrefix}-heading"
		class="font-heading text-foreground text-2xl leading-tight font-bold tracking-[-0.025em] sm:text-[1.875rem]"
	>
		{title}
	</h2>
	<p class="mt-3 text-base leading-relaxed text-zinc-300">{description}</p>

	<form class="mt-7" onsubmit={submit} aria-busy={phase === 'submitting'}>
		<input type="hidden" name="pageUrl" value={pageUrl} />
		<div class="grid gap-5 sm:grid-cols-2">
			<div class="min-w-0">
				<label for="{fieldPrefix}-name" class="text-foreground mb-2 block text-sm font-medium">
					Name
				</label>
				<input
					id="{fieldPrefix}-name"
					name="name"
					type="text"
					autocomplete="name"
					required
					minlength="2"
					maxlength="100"
					bind:value={name}
					oninput={() => clearFieldError('name')}
					disabled={phase === 'submitting'}
					aria-invalid={Boolean(fieldErrors.name)}
					aria-describedby={fieldErrors.name ? `${fieldPrefix}-name-error` : undefined}
				/>
				{#if fieldErrors.name}
					<p id="{fieldPrefix}-name-error" class="field-error">{fieldErrors.name}</p>
				{/if}
			</div>

			<div class="min-w-0">
				<label for="{fieldPrefix}-email" class="text-foreground mb-2 block text-sm font-medium">
					Official Email Address
				</label>
				<input
					id="{fieldPrefix}-email"
					name="email"
					type="email"
					autocomplete="email"
					inputmode="email"
					spellcheck="false"
					autocapitalize="none"
					required
					maxlength="254"
					bind:value={email}
					oninput={() => clearFieldError('email')}
					disabled={phase === 'submitting'}
					aria-invalid={Boolean(fieldErrors.email)}
					aria-describedby="{fieldPrefix}-email-hint{fieldErrors.email
						? ` ${fieldPrefix}-email-error`
						: ''}"
				/>
				<p id="{fieldPrefix}-email-hint" class="mt-2 text-xs leading-relaxed text-zinc-400">
					Use your company email address.
				</p>
				{#if fieldErrors.email}
					<p id="{fieldPrefix}-email-error" class="field-error">{fieldErrors.email}</p>
				{/if}
			</div>

			<div class="min-w-0">
				<label for="{fieldPrefix}-jobTitle" class="text-foreground mb-2 block text-sm font-medium">
					Job Title
				</label>
				<input
					id="{fieldPrefix}-jobTitle"
					name="jobTitle"
					type="text"
					autocomplete="organization-title"
					required
					minlength="1"
					maxlength="120"
					bind:value={jobTitle}
					oninput={() => clearFieldError('jobTitle')}
					disabled={phase === 'submitting'}
					aria-invalid={Boolean(fieldErrors.jobTitle)}
					aria-describedby={fieldErrors.jobTitle ? `${fieldPrefix}-jobTitle-error` : undefined}
				/>
				{#if fieldErrors.jobTitle}
					<p id="{fieldPrefix}-jobTitle-error" class="field-error">{fieldErrors.jobTitle}</p>
				{/if}
			</div>

			<div class="min-w-0">
				<label for="{fieldPrefix}-company" class="text-foreground mb-2 block text-sm font-medium">
					Company
				</label>
				<input
					id="{fieldPrefix}-company"
					name="company"
					type="text"
					autocomplete="organization"
					required
					minlength="1"
					maxlength="160"
					bind:value={company}
					oninput={() => clearFieldError('company')}
					disabled={phase === 'submitting'}
					aria-invalid={Boolean(fieldErrors.company)}
					aria-describedby={fieldErrors.company ? `${fieldPrefix}-company-error` : undefined}
				/>
				{#if fieldErrors.company}
					<p id="{fieldPrefix}-company-error" class="field-error">{fieldErrors.company}</p>
				{/if}
			</div>

			<div class="min-w-0 sm:col-span-2">
				<label for="{fieldPrefix}-phone" class="text-foreground mb-2 block text-sm font-medium">
					Phone Number
				</label>
				<div class="flex min-w-0 items-stretch gap-2">
					<CountryCodePicker
						id="{fieldPrefix}-country-code"
						bind:value={phoneCountry}
						disabled={phase === 'submitting'}
						onChange={() => {
							clearFieldError('phone');
							phone = nationalPhone(phone);
						}}
					/>
					<input
						id="{fieldPrefix}-phone"
						name="phone"
						type="tel"
						autocomplete="tel-national"
						inputmode="tel"
						required
						maxlength="40"
						bind:value={phone}
						oninput={() => {
							clearFieldError('phone');
							const pastedCountry = pastedPhoneCountry(phone);
							if (pastedCountry) phoneCountry = pastedCountry;
						}}
						class="min-w-0 flex-1"
						disabled={phase === 'submitting'}
						aria-invalid={Boolean(fieldErrors.phone)}
						aria-describedby="{fieldPrefix}-phone-hint{fieldErrors.phone
							? ` ${fieldPrefix}-phone-error`
							: ''}"
					/>
				</div>
				<p id="{fieldPrefix}-phone-hint" class="mt-2 text-xs leading-relaxed text-zinc-400">
					Choose your country code, then enter your phone number.
				</p>
				{#if fieldErrors.phone}
					<p id="{fieldPrefix}-phone-error" class="field-error">{fieldErrors.phone}</p>
				{/if}
			</div>
		</div>

		<div class="honeypot" aria-hidden="true">
			<label for="{fieldPrefix}-website">Website</label>
			<input
				id="{fieldPrefix}-website"
				name="website"
				type="text"
				tabindex="-1"
				autocomplete="off"
				bind:value={website}
			/>
		</div>

		<button
			type="submit"
			class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg px-6 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--card)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
			disabled={!configured || !mounted || phase === 'submitting'}
		>
			{#if phase === 'submitting'}
				<LoaderCircle class="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
				Preparing your PDF…
			{:else}
				<Download class="h-4 w-4" aria-hidden="true" />
				{phase === 'success' ? 'Get a new download link' : 'Download comparison PDF'}
			{/if}
		</button>

		{#if !configured}
			<p class="mt-3 text-sm text-zinc-400">Downloads will be available soon.</p>
		{/if}
		<div aria-live="polite" aria-atomic="true">
			{#if message}
				<p class="field-error mt-4" role="alert">{message}</p>
			{/if}
			{#if phase === 'success'}
				<p class="mt-4 text-sm text-zinc-300">
					Your PDF is ready. This link expires in five minutes.
					<a
						href={downloadUrl}
						class="text-primary rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
					>
						Open the comparison PDF
					</a>
				</p>
			{/if}
		</div>
	</form>
</section>

<style>
	input {
		display: block;
		width: 100%;
		min-height: 3rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--background);
		padding: 0.7rem 0.875rem;
		font-size: 1rem;
		line-height: 1.5;
		color: var(--foreground);
		transition: border-color 150ms;
	}

	input:hover {
		border-color: color-mix(in oklab, var(--primary) 45%, var(--border));
	}

	input:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 3px;
		border-color: var(--primary);
	}

	input[aria-invalid='true'] {
		border-color: #fca5a5;
	}

	input:disabled {
		opacity: 0.65;
	}

	.field-error {
		margin-top: 0.5rem;
		font-size: 0.8125rem;
		line-height: 1.5;
		color: #fca5a5;
	}

	.honeypot {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
