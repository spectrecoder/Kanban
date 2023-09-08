import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { AppProps, type AppType } from "next/app";
import { api } from "~/lib/api";
import "~/styles/globals.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { Toaster } from "~/components/ui/toaster";
import Layout from "~/components/Layout";
import { NextPage } from "next";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  isLayout?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// const MyApp: AppType<{ session: Session | null }> = ({
const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const isLayout = Component.isLayout ?? true;

  return (
    <SessionProvider session={session}>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        {isLayout ? (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        ) : (
          <Component {...pageProps} />
        )}
        <Toaster />
      </NextThemesProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
