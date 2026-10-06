// The SDK status table on /spec/sdk-requirements/, from src/lib/sdk-data.ts.
import { SDK_ROWS } from '@/lib/sdk-data';

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
];

export function SdkMatrix() {
	return (
		<div className="not-prose my-6 overflow-x-auto rounded-xl border border-border">
			<table className="w-full border-collapse text-left text-sm">
				<caption className="sr-only">What each docuconf SDK supports</caption>
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
					</tr>
				</thead>
				<tbody>
					{SDK_ROWS.map((r) => (
						<tr key={r.repo} className="align-top [&:not(:last-child)>*]:border-b [&>*]:border-border">
							<th scope="row" className="sticky left-0 whitespace-nowrap bg-bg px-3 py-2 font-semibold">
								<a href={`https://github.com/docuconf/${r.repo}`} className="text-accent hover:underline">
									{r.language}
								</a>
							</th>
							{COLUMNS.map((c) => (
								<td key={c.key} className="min-w-32 px-3 py-2 leading-relaxed">
									{r[c.key] as string}
								</td>
							))}
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
					<li key={r.repo}>
						<strong>{r.language}:</strong> {r.caveats.join(' ')}
					</li>
				))}
			</ul>
		</>
	);
}
