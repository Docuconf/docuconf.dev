// The example apps on /examples/, from src/lib/sdk-data.ts.
import { EXAMPLE_CONFIG, repoPath, SDK_ROWS } from '@/lib/sdk-data';

export function ExampleConfigTable() {
	return (
		<div className="not-prose my-6 overflow-x-auto rounded-xl border border-border">
			<table className="w-full border-collapse text-left text-sm">
				<caption className="sr-only">The configuration every example app declares</caption>
				<thead className="bg-card">
					<tr>
						{['Variable', 'Type', 'Rules'].map((h) => (
							<th key={h} scope="col" className="border-b border-border px-3 py-2 font-semibold">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{EXAMPLE_CONFIG.map((v) => (
						<tr key={v.name} className="[&:not(:last-child)>*]:border-b [&>*]:border-border">
							<th scope="row" className="px-3 py-2 font-mono font-semibold">
								{v.name}
							</th>
							<td className="px-3 py-2">{v.type}</td>
							<td className="px-3 py-2">{v.rules}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function ExampleList() {
	return (
		<ul className="not-prose my-6 grid gap-3 sm:grid-cols-2">
			{SDK_ROWS.flatMap((r) =>
				r.examples.map((e) => (
					<li key={`${r.repo}/${e.path}`}>
						<a
							href={repoPath(r.repo, e.path)}
							className="block rounded-xl border border-border bg-card px-4 py-3 hover:border-accent"
						>
							<span className="font-semibold">{r.language}</span>
							<span className="text-muted"> · {e.label}</span>
							<span className="mt-1 block font-mono text-xs text-muted">
								{r.repo}/{e.path}
							</span>
						</a>
					</li>
				)),
			)}
		</ul>
	);
}
