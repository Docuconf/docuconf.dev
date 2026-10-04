import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { SiteFooter, SiteHeader } from '@/components/site';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-face' });

export const metadata: Metadata = {
	title: {
		default: 'docuconf: typed environment contracts',
		template: '%s · docuconf',
	},
	description:
		'docuconf turns the config your app already declares into a CUE contract that your Kubernetes platform checks before anything deploys.',
	icons: { icon: `${process.env.BASE_PATH ?? ''}/favicon.svg` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${inter.variable} ${mono.variable}`}>
			<body className="min-h-dvh font-sans antialiased">
				<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50">
					Skip to content
				</a>
				<SiteHeader />
				<main id="main">{children}</main>
				<SiteFooter />
			</body>
		</html>
	);
}
