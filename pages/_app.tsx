import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Analytics } from '@vercel/analytics/react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import 'dayjs/locale/pl';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Cinema Seat Finder</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: 'dark',
        }}
      >
        <DatesProvider settings={{ locale: 'pl' }}>
          <Component {...pageProps} />
          <Analytics />
        </DatesProvider>
      </MantineProvider>
    </>
  );
}
