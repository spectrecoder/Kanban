import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/lib/api";
import "~/styles/globals.css";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        <Component {...pageProps} />
      </NextThemesProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
