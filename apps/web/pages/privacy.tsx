// apps/web/pages/privacy.tsx
import Head from "next/head";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy – Buraq AI</title>
        <meta
          name="description"
          content="How Buraq AI uses and protects your Google user data for the Calendar integration."
        />
      </Head>

      <main className="mx-auto max-w-3xl px-6 py-12 leading-7">
        <h1 className="text-2xl font-semibold">Privacy Policy – Buraq AI</h1>
        <p className="mt-1 text-sm text-gray-500">Last updated: September 25, 2025</p>

        <p className="mt-6">
          Buraq AI (“we”, “our”, “us”) provides a booking experience built on Cal.com that
          integrates with Google Calendar. This Privacy Policy explains <strong>what data we
          access</strong>, <strong>how we use it</strong>, and <strong>how we protect it</strong>.
          This policy specifically covers our use of Google user data obtained via Google APIs.
        </p>

        <h2 className="mt-8 text-xl font-medium">Data We Access</h2>
        <ul className="list-disc pl-6">
          <li><strong>Google Account basic profile</strong> (name, email) during OAuth to identify your account.</li>
          <li><strong>Google Calendar data</strong> that you explicitly authorize:
            <ul className="list-disc pl-6 mt-2">
              <li>Free/busy and event metadata needed to compute availability. (<code>calendar.readonly</code>)</li>
              <li>Events we create/update when a booking is confirmed. (<code>calendar.events</code>)</li>
            </ul>
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-medium">How We Use Google User Data</h2>
        <ul className="list-disc pl-6">
          <li>To display your availability inside Buraq AI and prevent double-booking.</li>
          <li>To create/update a calendar event in your Google Calendar when someone books with you.</li>
          <li>We do <strong>not</strong> use Google user data for advertising or profiling.</li>
          <li>We do <strong>not</strong> sell or rent Google user data to third parties.</li>
        </ul>

        <h2 className="mt-8 text-xl font-medium">Google API Services User Data Policy (Limited Use)</h2>
        <p>
          Our use and transfer of information received from Google APIs adheres to Google API
          Services User Data Policy, including the <strong>Limited Use</strong> requirements. We only
          use Google user data to provide and improve the features described above, do not transfer it
          except as necessary to provide the service, and do not use it for ads.
        </p>

        <h2 className="mt-8 text-xl font-medium">Data Protection & Security</h2>
        <ul className="list-disc pl-6">
          <li><strong>Transport encryption:</strong> All data is transmitted over HTTPS/TLS.</li>
          <li><strong>At-rest protection:</strong> Data stored in our databases is encrypted at rest.</li>
          <li><strong>OAuth tokens:</strong> Access tokens are stored securely and rotated by Google; we store only what is required to operate the integration.</li>
          <li><strong>Access control:</strong> Role-based access with least-privilege; production access is limited to authorized personnel and logged.</li>
          <li><strong>Secrets management:</strong> API keys and credentials are kept in a secure secrets store (e.g., environment secrets/manager) and never committed to source code.</li>
          <li><strong>Monitoring & logging:</strong> Authentication, calendar operations, and admin actions are logged for security and troubleshooting.</li>
          <li><strong>Subprocessors/Infrastructure:</strong> We run on Google Cloud (e.g., Cloud Run, managed databases/storage) with managed networking and encryption.</li>
          <li><strong>Incident response:</strong> We investigate security incidents promptly and notify affected users when required by law.</li>
        </ul>

        <h2 className="mt-8 text-xl font-medium">Data Retention</h2>
        <ul className="list-disc pl-6">
          <li>We retain only the minimum necessary data to operate bookings and sync with your calendar.</li>
          <li>Operational logs are retained for a limited period for security and troubleshooting, then purged.</li>
          <li>If you disconnect Google, associated tokens are revoked and removed; related operational data is scheduled for deletion in regular cleanup cycles.</li>
        </ul>

        <h2 className="mt-8 text-xl font-medium">Data Deletion & Your Controls</h2>
        <ul className="list-disc pl-6">
          <li>You may revoke our access anytime at your <a className="underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">Google Account permissions</a>.</li>
          <li>You can request deletion of your data by contacting <a className="underline" href="mailto:support@buraq.ai">support@buraq.ai</a>. We will delete or anonymize data that we are not legally required to retain.</li>
        </ul>

        <h2 className="mt-8 text-xl font-medium">Data Sharing</h2>
        <ul className="list-disc pl-6">
          <li>We do not sell or rent user data.</li>
          <li>We do not share Google user data with third parties except:
            <ul className="list-disc pl-6 mt-2">
              <li>Subprocessors necessary to provide the service (e.g., Google Cloud hosting) under appropriate data protection terms, or</li>
              <li>When required by law or to protect rights, property, or safety.</li>
            </ul>
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-medium">International Transfers</h2>
        <p>
          Data may be processed in data centers operated by our cloud providers. We use industry-standard safeguards for international transfers where applicable.
        </p>

        <h2 className="mt-8 text-xl font-medium">Children</h2>
        <p>
          Our services are not directed to children under 13, and we do not knowingly collect their personal information.
        </p>

        <h2 className="mt-8 text-xl font-medium">Contact</h2>
        <p>
          Questions or requests: <a className="underline" href="mailto:support@buraq.ai">support@buraq.ai</a>
        </p>

        <p className="mt-10 text-sm text-gray-500">
          Note: This policy applies to Google user data accessed via Google APIs as part of the Buraq AI Calendar integration.
        </p>
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
