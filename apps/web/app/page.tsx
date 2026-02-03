import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Precruit
        </h1>

        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg">
          Detect hiring intent before roles are posted.
        </p>

        <ul className="mt-8 text-left list-disc list-inside space-y-2 text-gray-600 sm:text-base max-w-md mx-auto">
          <li>Startup-focused signals</li>
          <li>Intern roles: SWE, SRE, infra/platform, PM</li>
          <li>Alerts when a company turns green</li>
        </ul>

        <div className="mt-8 sm:mt-12">
          <Link href="/dashboard" className="btn btn-primary">
            Explore Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
