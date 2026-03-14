import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'KIIT Wellness Space',
    description: 'A safe space for student mental health reflection.',
    icons: {
        icon: '/favicon.svg',
        apple: '/favicon.svg',
    },
};

import { Providers } from './providers';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${outfit.variable} font-sans min-h-screen bg-background text-text-primary selection:bg-primary-soft selection:text-primary`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
