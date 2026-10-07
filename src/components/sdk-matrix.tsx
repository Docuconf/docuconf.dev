// The SDK status table on /spec/sdk-requirements/, from src/lib/sdk-data.ts.
import Link from 'next/link';
import { repoPath, SDK_DATA_DATE, SDK_ROWS } from '@/lib/sdk-data';

const COLUMNS: { key: keyof (typeof SDK_ROWS)[number]; label: string }[] = [
	{ key: 'host', label: 'Host library' },
	{ key: 'package', label: 'Package' },
	{ key: 'types', label: 'Variable types' },
	{ key: 'lists', label: 'Lists' },
	{ key: 'durations', label: 'Durations' },
	{ key: 'configFormats', label: 'Config files' },
	{ key: 'keystore', label: 'Keystores' },
	{ key: 'watch', label: 'reload: watch' },
	{ key: 'profiles', label: 'Profiles' },
	{ key: 'export', label: 'Export' },
	{ key: 'conformance', label: 'Conformance' },
];

export function SdkMatrix() {
	return (
		<div
			role="region"
			aria-label="What each SDK supports (scrolls sideways)"
			tabIndex={0}
			className="not-prose my-6 overflow-x-auto rounded-xl border border-border"
		>
			<table className="w-full border-collapse text-left text-sm">
				<caption className="caption-bottom px-3 py-2 text-left text-xs text-muted">
					What each docuconf SDK supports, from each repository&apos;s main branch, checked {SDK_DATA_DATE}.
				</caption>
				<thead className="bg-card">
					<tr>
						<th scope="col" className="sticky left-0 border-b border-border bg-card px-3 py-2 font-semibold">
							SDK
						</th>
						{COLUMNS.map((c) => (
							<th key={c.key} scope="col" className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold">
								{c.label}
							</th>
						))}
						<th scope="col" className="whitespace-nowrap border-b border-border px-3 py-2 font-semibold">
							Example
						</th>
					</tr>
				</thead>
				<tbody>
					{SDK_ROWS.map((r) => (
						<tr key={r.slug} className="align-top [&:not(:last-child)>*]:border-b [&>*]:border-border">
							<th scope="row" className="sticky left-0 whitespace-nowrap bg-bg px-3 py-2 font-semibold">
								<Link href={`/languages/${r.slug}/`} className="text-accent hover:underline">
									{r.name}
								</Link>
							</th>
							{COLUMNS.map((c) => (
								<td key={c.key} className="min-w-32 px-3 py-2 leading-relaxed">
									{r[c.key] as string}
								</td>
							))}
							<td className="min-w-32 px-3 py-2 leading-relaxed">
								<a href={repoPath(r.repo, r.example.path)} className="text-accent hover:underline">
									{r.example.label}
								</a>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function SdkCaveats() {
	return (
		<>
			<h3>Known gaps</h3>
			<ul>
				{SDK_ROWS.map((r) => (
					<li key={r.slug}>
						<strong>{r.name}:</strong> {r.caveats.join(' ')}
					</li>
				))}
			</ul>
		</>
	);
}
