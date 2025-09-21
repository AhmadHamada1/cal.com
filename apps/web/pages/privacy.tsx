export default function Privacy() {
  return (
    <main style={{maxWidth: 800, margin: "40px auto", padding: "0 16px", lineHeight: 1.7}}>
      <h1>Privacy Policy – Buraq AI</h1>
      <p>Last updated: September 21, 2025</p>
      <p>
        Buraq AI ("we", "our", or "us") respects your privacy. This Privacy Policy explains how
        we handle information when you use our integration with Google services such as Google Calendar.
      </p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Google account profile info (name, email address).</li>
        <li>Calendar data (events, availability) that you authorize.</li>
      </ul>
      <h2>How We Use the Information</h2>
      <ul>
        <li>To allow you to view and manage events inside Buraq AI / Booking system.</li>
        <li>To sync your Google Calendar availability with bookings.</li>
      </ul>
      <h2>Data Sharing</h2>
      <p>We do not sell, rent, or share your Google Calendar data with third parties.</p>
      <h2>Your Control</h2>
      <p>
        You can revoke access anytime from{" "}
        <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
          Google Account permissions
        </a>.
      </p>
      <h2>Contact Us</h2>
      <p>Email: support@buraq.ai</p>
    </main>
  );
}
