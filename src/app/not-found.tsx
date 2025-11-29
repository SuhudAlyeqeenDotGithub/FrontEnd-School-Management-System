import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <div className=" flex flex-col items-center mb-5">
        <div className="h-20 w-45">
          <img src="/suhudlogo.png" className="h-full w-full" alt="Suhud Logo" />
        </div>
        <p className="text-[18px] text-[#0097a7]  font-medium">School Management System</p>
      </div>
      <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>
      <p className="mb-6">Oops! The page you’re looking for doesn’t exist or not available yet.</p>
      <Link href="/main" className="text-[#0097a7]  underline">
        Go back home
      </Link>
    </div>
  );
}
