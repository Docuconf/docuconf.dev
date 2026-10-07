// The docuconf vet run CI checks against docuconf-go's orders example (snippets/go/).
import { Code } from './code';
import { SDK_ROWS } from '@/lib/sdk-data';
import { snippetText, transcript } from '@/lib/snippets';

export function GoVet() {
	const go = SDK_ROWS.find((r) => r.slug === 'go')!;
	return (
		<>
			<Code lang="yaml" title="values.yaml" code={snippetText('go', { file: 'overlay/examples/orders/values.yaml', lang: 'yaml' })} />
			<Code lang="shellsession" title="Terminal" code={`${transcript(go, 'vet')}\n$ echo $?\n1`} />
		</>
	);
}
