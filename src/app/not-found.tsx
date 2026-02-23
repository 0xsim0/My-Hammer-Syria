import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600">Page not found</p>
      <Link href="/" className="text-primary-600 hover:underline">
        Go back home
      </Link>
    </div>
  );
}
