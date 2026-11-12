import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="max-w-md text-center">
        <p className="text-sm font-bold uppercase text-blue-700">404</p>

        <h1 className="mt-2 text-3xl font-bold text-slate-950">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          The page you are looking for does not exist or you may not have access
          to it.
        </p>

        <Link to="/dashboard" className="mt-6 inline-flex">
          <Button type="button">Go to dashboard</Button>
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;
