<script lang="ts">
	import { Command, Popover } from 'bits-ui';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Search from '@lucide/svelte/icons/search';
	import type { CountryCode } from 'libphonenumber-js';
	import { phoneCountries, searchCountry } from '$lib/forms/phone-number';

	let {
		value = $bindable<CountryCode>('US'),
		disabled = false,
		id,
		onChange
	}: {
		value?: CountryCode;
		disabled?: boolean;
		id: string;
		onChange?: () => void;
	} = $props();
	let open = $state(false);
	let trigger = $state<HTMLButtonElement | null>(null);
	let searchInput = $state<HTMLInputElement | null>(null);
	const selected = $derived(phoneCountries.find((country) => country.code === value)!);
	const flags = import.meta.glob<string>('/node_modules/country-flag-icons/3x2/*.svg', {
		eager: true,
		query: '?url',
		import: 'default'
	});
	const flag = (code: string) => flags[`/node_modules/country-flag-icons/3x2/${code}.svg`];

	function select(code: CountryCode) {
		value = code;
		open = false;
		onChange?.();
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		{id}
		bind:ref={trigger}
		type="button"
		{disabled}
		aria-label={`Country calling code: ${selected.name}, +${selected.callingCode}`}
		class="border-border bg-background text-foreground hover:border-primary/50 focus-visible:outline-primary flex min-h-12 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-3 disabled:opacity-60"
	>
		<img
			src={flag(value)}
			alt=""
			width="24"
			height="16"
			class="h-4 w-6 rounded-[2px] object-cover"
		/>
		<span>+{selected.callingCode}</span>
		<ChevronDown class="h-4 w-4 text-zinc-400" aria-hidden="true" />
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			sideOffset={8}
			align="start"
			class="dark border-border bg-background text-foreground z-[100] w-[min(22rem,calc(100vw-2rem))] rounded-xl border p-2 font-sans shadow-xl"
			onCloseAutoFocus={(event) => {
				event.preventDefault();
				trigger?.focus({ preventScroll: true });
			}}
			onOpenAutoFocus={(event) => {
				event.preventDefault();
				// Wait for the portal's floating position before focusing an offscreen input.
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						if (open) searchInput?.focus({ preventScroll: true });
					});
				});
			}}
		>
			<Command.Root
				label="Choose a country calling code"
				loop
				disableInitialScroll
				filter={(value, query) => (searchCountry(value, query) ? 1 : 0)}
			>
				<div class="border-border mb-2 flex items-center gap-2 border-b px-2 pb-2">
					<Search class="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
					<Command.Input
						bind:ref={searchInput}
						aria-label="Search countries or calling codes"
						placeholder="Search country or code…"
						autocomplete="off"
						class="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-zinc-500"
					/>
				</div>
				<Command.List class="max-h-64 overflow-y-auto overscroll-contain">
					<Command.Empty class="px-3 py-6 text-center text-sm text-zinc-400"
						>No countries found.</Command.Empty
					>
					{#each phoneCountries as country (country.code)}
						<Command.Item
							value={`${country.name} ${country.code} +${country.callingCode}`}
							onSelect={() => select(country.code)}
							class="data-[selected=true]:bg-primary/10 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm"
						>
							<img
								src={flag(country.code)}
								alt=""
								width="24"
								height="16"
								loading="lazy"
								class="h-4 w-6 shrink-0 rounded-[2px] object-cover"
							/>
							<span class="min-w-0 flex-1">{country.name}</span>
							<span class="text-zinc-400">+{country.callingCode}</span>
							<Check
								class="text-primary h-4 w-4 shrink-0 {value === country.code ? '' : 'invisible'}"
								aria-hidden="true"
							/>
						</Command.Item>
					{/each}
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
