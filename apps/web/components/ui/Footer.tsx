export default function Footer() {
  return (
    <footer className="border-t py-6 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} Buraq AI. All rights reserved.</p>
      <div className="mt-2 flex justify-center space-x-4">
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        <a href="/terms" className="hover:underline">Terms of Service</a>
      </div>
    </footer>
  );
}
