// Tables for the /spec pages, rendered from src/lib/spec-data.ts.
import type { ReactNode } from 'react';
import {
	DURATION_ENCODINGS,
	ERROR_CODES,
	FILE_FIELDS,
	FILE_SOURCES,
	FILE_TYPES,
	INJECTORS,
	LIST_ENCODINGS,
	OUTPUTS,
	OVERLAY_HOSTS,
	SDK_MUSTS,
	SDK_SHOULDS,
	SPEC_FAQ,
	STATUS_LABEL,
	type Status,
	VALUE_SOURCES,
	VAR_FIELDS,
	VAR_TYPES,
} from '@/lib/spec-data';

/** A JSON-LD block. Content is our own static data, serialised at build time. */
export function JsonLd({ data }: { data: object }) {
	return (
		<script
			type="application/ld+json"
			// "<" is escaped so the JSON can never close the script element.
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
		/>
	);
}

const STATUS_STYLE: Record<Status, string> = {
	implemented: 'border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
	specified: 'border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
	planned: 'border-border bg-card text-muted',
};

export function StatusBadge({ status }: { status: Status }) {
	return (
		<span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
			{STATUS_LABEL[status]}
		</span>
	);
}

export function Table({ head, rows, caption }: { head: string[]; rows: ReactNode[][]; caption?: string }) {
	return (
		<div
			role="region"
			aria-label={`${caption ?? 'Table'} (scrolls sideways)`}
			tabIndex={0}
			className="not-prose my-6 overflow-x-auto rounded-xl border border-border"
		>
			<table className="w-full border-collapse text-left text-sm">
				{caption && <caption className="sr-only">{caption}</caption>}
				<thead className="bg-card">
					<tr>
						{head.map((h) => (
							<th key={h} scope="col" className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={i} className="align-top [&:not(:last-child)>td]:border-b [&>td]:border-border">
							{r.map((c, j) => (
								<td key={j} className="px-3 py-2 leading-relaxed">
									{c}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

const C = ({ children }: { children: ReactNode }) => (
	<code className="whitespace-nowrap rounded bg-card px-1 py-0.5 font-mono text-[0.85em]">{children}</code>
);

export const VarTypesTable = () => (
	<Table
		caption="Variable types"
		head={['Type', 'Meaning', 'Constraint fields', 'Platform value', 'Wire form']}
		rows={VAR_TYPES.map((t) => [<C key="t">{t.type}</C>, t.summary, t.constraints, t.platformValue, t.wire])}
	/>
);

export const VarFieldsTable = () => (
	<Table caption="Variable fields" head={['Field', 'Rule']} rows={VAR_FIELDS.map((f) => [<C key="f">{f.field}</C>, f.rule])} />
);

export const ValueSourcesTable = () => (
	<Table
		caption="Value sources"
		head={['Source', 'Example', 'Allowed for', 'Checked', 'Status']}
		rows={VALUE_SOURCES.map((s) => [
			s.source,
			<C key="e">{s.example}</C>,
			s.allowedFor,
			s.checked,
			<StatusBadge key="s" status={s.status ?? 'implemented'} />,
		])}
	/>
);

export const InjectorsTable = () => (
	<Table
		caption="Runtime injectors"
		head={['Injector', 'What it does', 'How the contract describes it']}
		rows={INJECTORS.map((i) => [i.name, i.how, i.docuconf])}
	/>
);

export const FileTypesTable = () => (
	<Table
		caption="File input types"
		head={['Type', 'Content', 'Constraint fields', 'Secret']}
		rows={FILE_TYPES.map((t) => [<C key="t">{t.type}</C>, t.content, t.constraints, t.secret])}
	/>
);

export const FileFieldsTable = () => (
	<Table caption="File input fields" head={['Field', 'Rule']} rows={FILE_FIELDS.map((f) => [<C key="f">{f.field}</C>, f.rule])} />
);

export const FileSourcesTable = () => (
	<Table
		caption="File sources"
		head={['Source', 'For', 'Checked before deploy', 'Status']}
		rows={FILE_SOURCES.map((s) => [
			s.source,
			s.forTypes,
			s.checkedBeforeDeploy,
			<StatusBadge key="s" status={s.status ?? 'implemented'} />,
		])}
	/>
);

export const OverlayHostsTable = () => (
	<Table
		caption="Hosts that layer config files"
		head={['Host', 'Baked-in files', 'Platform overlay', 'Reload']}
		rows={OVERLAY_HOSTS.map((h) => [h.host, h.base, <C key="o">{h.overlay}</C>, h.reload])}
	/>
);

export const EncodingTables = () => (
	<>
		<Table
			caption="List encodings"
			head={['List encoding', 'Wire form', 'Native to']}
			rows={LIST_ENCODINGS.map((e) => [<C key="e">{e.encoding}</C>, <C key="w">{e.wire}</C>, e.nativeTo])}
		/>
		<Table
			caption="Duration encodings"
			head={['Duration encoding', 'Wire form for 90s', 'Native to']}
			rows={DURATION_ENCODINGS.map((e) => [<C key="e">{e.encoding}</C>, <C key="w">{e.wire}</C>, e.nativeTo])}
		/>
	</>
);

export function OutputsTable({ status }: { status?: Status }) {
	const rows = OUTPUTS.filter((o) => !status || o.status === status);
	return (
		<Table
			caption="Generation targets"
			head={['Output', 'Artifact', 'Produced by', 'Consumed by', 'Status']}
			rows={rows.map((o) => [
				<span key="n" id={o.id} className="font-medium">
					{o.name}
				</span>,
				o.artifact,
				o.producedBy,
				o.consumedBy,
				<StatusBadge key="s" status={o.status} />,
			])}
		/>
	);
}

export function OutputDetails() {
	return (
		<dl className="not-prose my-6 space-y-4">
			{OUTPUTS.map((o) => (
				<div key={o.id} className="rounded-xl border border-border p-4">
					<dt className="flex flex-wrap items-center gap-2 font-semibold">
						{o.name} <StatusBadge status={o.status} />
					</dt>
					<dd className="mt-1 text-sm leading-relaxed text-muted">{o.notes}</dd>
				</div>
			))}
		</dl>
	);
}

function Numbered({ items }: { items: { title: string; detail: string }[] }) {
	return (
		<ol className="not-prose my-6 space-y-3">
			{items.map((m, i) => (
				<li key={m.title} className="flex gap-3">
					<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
						{i + 1}
					</span>
					<div className="text-sm leading-relaxed">
						<span className="font-semibold">{m.title}.</span> <span className="text-muted">{m.detail}</span>
					</div>
				</li>
			))}
		</ol>
	);
}

export const MustList = () => <Numbered items={SDK_MUSTS} />;
export const ShouldList = () => <Numbered items={SDK_SHOULDS} />;

export const ErrorCodesTable = () => (
	<Table caption="Boot error codes" head={['Code', 'Meaning']} rows={ERROR_CODES.map((e) => [<C key="c">{e.code}</C>, e.meaning])} />
);

/** The FAQ, visible on the page (FAQPage JSON-LD must match visible content). */
export function Faq() {
	return (
		<div className="not-prose my-6 space-y-3">
			{SPEC_FAQ.map((f) => (
				<details key={f.q} className="group rounded-xl border border-border p-4 open:bg-card">
					<summary className="cursor-pointer list-none font-semibold [&::-webkit-details-marker]:hidden">
						<h3 className="inline text-base">{f.q}</h3>
					</summary>
					<p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
				</details>
			))}
		</div>
	);
}

export function faqJsonLd() {
	return {
		'@type': 'FAQPage',
		mainEntity: SPEC_FAQ.map((f) => ({
			'@type': 'Question',
			name: f.q,
			acceptedAnswer: { '@type': 'Answer', text: f.a },
		})),
	};
}
