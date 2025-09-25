import Head from "next/head";

export default function Homepage() {
  return (
    <>
      <Head>
        <title>Buraq AI – Calendar Connect</title>
        <meta
          name="description"
          content="Buraq AI Calendar Connect integrates with Google Calendar to sync availability and create bookings automatically."
        />
      </Head>

      <main className="min-h-[70vh] mx-auto max-w-4xl px-6 py-16">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Buraq AI – Calendar Connect
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A secure booking experience powered by Cal.com and Buraq AI.  
            We integrate with Google Calendar to{" "}
            <strong>read availability</strong> and{" "}
            <strong>create events automatically</strong>.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a
              href="/auth/google" // حط مسار Google OAuth عندك
              className="rounded-md border px-5 py-2 hover:bg-gray-50"
            >
              Connect Google Calendar
            </a>
            <a
              href="/admin/15min"
              className="rounded-md border px-5 py-2 hover:bg-gray-50"
            >
              Try a booking page
            </a>
          </div>
        </section>

        {/* What the App Does */}
        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-md border p-6">
            <h2 className="text-xl font-medium">What the app does</h2>
            <ul className="mt-3 list-disc pl-5 text-gray-700">
              <li>Shows your Google Calendar availability in Buraq AI Booking.</li>
              <li>Creates events when someone books a meeting.</li>
              <li>Keeps everything in sync to avoid conflicts.</li>
            </ul>
          </div>

          <div className="rounded-md border p-6">
            <h2 className="text-xl font-medium">How we use Google data</h2>
            <ul className="mt-3 list-disc pl-5 text-gray-700">
              <li>
                <code>calendar.readonly</code>: read events to check free/busy
                times.
              </li>
              <li>
                <code>calendar.events</code>: create/update events when a booking
                happens.
              </li>
            </ul>
            <p className="mt-3 text-gray-600">
              Data is used only for booking purposes. We don’t sell or share it
              with third parties.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-16 rounded-md border p-6">
          <h2 className="text-xl font-medium">Contact</h2>
          <p className="mt-2 text-gray-700">
            For questions about the integration, email{" "}
            <a className="underline" href="mailto:support@buraq.ai">
              support@buraq.ai
            </a>
          </p>
        </section>
      </main>

      {/* Footer */}
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
    </>
  );
}
