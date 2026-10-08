// The /spec/generated-docs/ page's tables and example, from src/lib/sdk-data.ts and snippets/.
import Link from 'next/link';
import { Code } from './code';
import { Inline } from './inline';
import { Table } from './spec-tables';
import { SDK_ROWS } from '@/lib/sdk-data';
import { snippetText } from '@/lib/snippets';

/** Where each SDK takes an input's description and details from. */
export function DocsSourcesTable() {
	return (
		<Table
			caption="Where each SDK takes description and details from"
			head={['SDK', 'description', 'details']}
			rows={SDK_ROWS.map((r) => [
				<Link key="n" href={`/languages/${r.slug}/`} className="whitespace-nowrap text-accent hover:underline">
					{r.name}
				</Link>,
				<Inline key="d" text={r.docs.description} />,
				<Inline key="t" text={r.docs.details} />,
			])}
		/>
	);
}

/** The Go orders example's WORKER_COUNT: its doc comment, and what the contract holds. */
export function DocsExample() {
	return (
		<>
			<Code
				lang="go"
				title="internal/config/config.go"
				code={snippetText('go', {
					file: 'sdk/examples/orders/internal/config/config.go',
					lang: 'go',
					from: '// Number of background workers',
					to: 'WorkerCount int',
				})}
			/>
			<Code
				lang="cue"
				title="contract.cue"
				code={snippetText('go', { file: 'sdk/examples/orders/contract.cue', lang: 'cue', from: 'WORKER_COUNT: {', to: '^\t\t}' })}
			/>
		</>
	);
}
