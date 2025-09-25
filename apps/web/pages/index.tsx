// apps/web/pages/index.tsx
import Head from "next/head";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Buraq AI – Calendar Connect</title>
        <meta name="description" content="Connect Google Calendar to Buraq AI booking to sync availability and create events automatically." />
      </Head>

      <main className="min-h-[70vh] mx-auto max-w-4xl px-6 py-16">
        <section className="text-center">
          <h1 className="text-3xl md:text-5xl font-semibold">Buraq AI – Calendar Connect</h1>
          <p className="mt-4 text-lg text-gray-600">
            A Cal.com-based booking experience by Buraq AI that securely integrates with Google Calendar
            to <strong>read availability</strong> and <strong>create bookings as calendar events</strong>.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="/auth/google" // أو المسار اللي بيوصل لعملية الربط عندك
              className="rounded-md border px-5 py-2 hover:bg-gray-50"
            >
              Connect Google Calendar
            </a>
            <a
              href="/admin/15min"
              className="rounded-md border px-5 py-2 hover:bg-gray-50"
            >
              Try a public booking page
            </a>
          </div>
        </section>

        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-md border p-6">
            <h2 className="text-xl font-medium">What the app does</h2>
            <ul className="mt-3 list-disc pl-5 text-gray-700">
              <li>Displays your Google Calendar availability inside Buraq AI / Cal.com.</li>
              <li>Creates events on your calendar when a booking is confirmed.</li>
              <li>Keeps schedules in sync and prevents conflicts.</li>
            </ul>
          </div>

          <div className="rounded-md border p-6">
            <h2 className="text-xl font-medium">How we use Google scopes</h2>
            <ul className="mt-3 list-disc pl-5 text-gray-700">
              <li><code>calendar.readonly</code>: read events to calculate free/busy availability.</li>
              <li><code>calendar.events</code>: create/update booking events on your calendar.</li>
            </ul>
            <p className="mt-3 text-gray-600">
              We only use data for booking features. No selling or sharing with third parties.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-md border p-6">
          <h2 className="text-xl font-medium">Contact</h2>
          <p className="mt-2 text-gray-700">
            For questions about the integration, email <a className="underline" href="mailto:support@buraq.ai">support@buraq.ai</a>.
          </p>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Buraq AI. All rights reserved.</p>
        <div className="mt-2 flex justify-center space-x-4">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/terms" className="hover:underline">Terms of Service</a>
        </div>
      </footer>
    </>
  );
}
