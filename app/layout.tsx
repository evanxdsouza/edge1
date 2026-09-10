import type { Metadata } from 'next';
import { Bricolage_Grotesque, Instrument_Sans, Martian_Mono } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const body = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

const mono = Martian_Mono({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Edge: make a model small enough to hold',
  description:
    'A draft Hack Club YSWS. Spend 35+ hours building your own small language model and a wrapper anyone can use, and get a Raspberry Pi 5 with an AI HAT+ to run it on.',
  openGraph: {
    title: 'Edge: make a model small enough to hold',
    description:
      'Build your own small language model and its wrapper in 35+ hours. Ship it, and a Raspberry Pi 5 with an AI HAT+ lands at your door.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-tone="dark">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
