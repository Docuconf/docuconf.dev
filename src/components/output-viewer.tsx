import Link from 'next/link';
import { Code } from './code';
import { Tab, Tabs } from './tabs';
import type { OutputTab } from '@/lib/outputs';

/** One tab per file a contract produces: who reads it, the command that makes it, and the file (or an excerpt). */
export function OutputViewer({ tabs }: { tabs: OutputTab[] }) {
	return (
		<div className="output-viewer">
			<Tabs label="Files generated from the contract">
				{tabs.map((t) => (
					<Tab key={t.label} label={t.label}>
						<p className="text-sm text-muted">{t.caption}</p>
						{t.command && (
							<p className="mt-2 break-words font-mono text-xs text-muted">
								<span className="sr-only">Made by: </span>
								<span aria-hidden="true">$ </span>
								{t.command}
							</p>
						)}
						<Code lang={t.lang} title={t.full ? `${t.title} (excerpt)` : t.title} code={t.code} />
						{t.full && (
							<p className="-mt-2 text-sm">
								Excerpt.{' '}
								<a href={t.full} className="text-accent underline">
									Full {t.title} on GitHub
								</a>
							</p>
						)}
					</Tab>
				))}
			</Tabs>
			<p className="text-sm text-muted">
				Every file comes from docuconf-go&apos;s orders example and is checked against its main branch in CI.{' '}
				<Link href="/spec/outputs/" className="font-semibold text-accent underline">
					Every output, and its status →
				</Link>
			</p>
		</div>
	);
}
