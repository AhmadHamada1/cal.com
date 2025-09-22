import type { IncomingMessage } from "http";
import type { NextPageContext } from "next";
import { SessionProvider } from "next-auth/react";
import React from "react";
import CacheProvider from "react-inlinesvg/provider";

import { WebPushProvider } from "@calcom/features/notifications/WebPushContext";
import { trpc } from "@calcom/trpc/react";

import type { AppProps } from "@lib/app-providers";

import "../styles/globals.css";

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <SessionProvider session={pageProps.session ?? undefined}>
      <WebPushProvider>
        {/* @ts-expect-error FIXME remove this comment when upgrading typescript to v5 */}
        <CacheProvider>
          {Component.PageWrapper ? (
            <Component.PageWrapper {...props} />
          ) : (
            <Component {...pageProps} />
          )}

          {/* ✅ Footer ثابت */}
          <footer className="border-t py-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Buraq AI. All rights reserved.</p>
            <div className="mt-2 flex justify-center space-x-4">
              <a href="/privacy" className="hover:underline">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:underline">
                Terms of Service
              </a>
            </div>
          </footer>
        </CacheProvider>
      </WebPushProvider>
    </SessionProvider>
  );
}

declare global {
  interface Window {
    calNewLocale: string;
  }
}

MyApp.getInitialProps = async ({ ctx }: { ctx: NextPageContext }) => {
  const { req } = ctx;

  let newLocale = "en";

  if (req) {
    const { getLocale } = await import("@calcom/features/auth/lib/getLocale");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newLocale = await getLocale(req as IncomingMessage & { cookies: Record<string, any> });
  } else if (typeof window !== "undefined" && window.calNewLocale) {
    newLocale = window.calNewLocale;
  }

  return {
    pageProps: {
      newLocale,
    },
  };
};

const WrappedMyApp = trpc.withTRPC(MyApp);

export default WrappedMyApp;
