import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { SiteFooter, SiteHeader } from '@/components/site';
import { JsonLd } from '@/components/spec-tables';
import { organization, SITE_NAME, SITE_URL, website } from '@/lib/seo';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-face' });

const DESCRIPTION =
	'docuconf turns the config your app already declares into a typed contract that your Kubernetes platform checks before anything deploys, and your app checks again at boot.';

export const metadata: Metadata = {
	metadataBase: new URL(`${SITE_URL}/`),
	applicationName: SITE_NAME,
	title: {
		default: 'docuconf: typed environment contracts',
		template: '%s · docuconf',
	},
	description: DESCRIPTION,
	keywords: [
		'configuration contract',
		'environment variables',
		'typed config',
		'Kubernetes',
		'CUE',
		'Crossplane',
		'Helm values schema',
		'platform engineering',
	],
	openGraph: { type: 'website', siteName: SITE_NAME, url: '/', title: 'docuconf: typed environment contracts', description: DESCRIPTION },
	twitter: { card: 'summary', title: 'docuconf: typed environment contracts', description: DESCRIPTION },
	alternates: {
		types: { 'application/ld+json': '/docuconf.jsonld', 'text/plain': '/llms.txt' },
	},
	icons: { icon: `${process.env.BASE_PATH ?? ''}/favicon.svg` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${inter.variable} ${mono.variable}`}>
			<body className="min-h-dvh font-sans antialiased">
				<JsonLd data={{ '@context': 'https://schema.org', '@graph': [organization(), website()] }} />
				<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50">
					Skip to content
				</a>
				<SiteHeader />
				<main id="main" data-pagefind-body>
					{children}
				</main>
				<SiteFooter />
			</body>
		</html>
	);
}
