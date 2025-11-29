import { auth } from "@/auth";

// Turn layout into an async server component so we can gate access with auth()
export default async function AdminLayout({ children }) {
  const session = await auth();

  // If not signed in, block access and show a friendly sign-in card
  if (!session || !session.user) {
    return (
      <div className="min-h-screen w-full bg-white text-[#111827] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-2 text-center">
            Sign in required
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center">
            You need to sign in to view the admin pages.
          </p>
          <div className="flex flex-col gap-3">
            <a
              href="/account/signin"
              className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              Go to sign in
            </a>
            <a
              href="/"
              className="text-center text-sm text-[#357AFF] hover:text-[#2E69DE]"
            >
              Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If signed in, render admin chrome + a small profile menu
  const email = session.user.email || "Account";
  const name = session.user.name || null;
  const initials = (name || email || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen w-full bg-white text-[#111827]">
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-black text-white grid place-items-center text-sm">
              ♛
            </div>
            <h1 className="text-xl font-bold">ChessMasters Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4 text-sm">
              <a className="hover:underline" href="/admin">
                Dashboard
              </a>
              <a className="hover:underline" href="/admin/plans">
                Plans
              </a>
              <a className="hover:underline" href="/admin/referrals">
                Referrals
              </a>
              <a className="hover:underline" href="/admin/masters">
                Masters
              </a>
              <a className="hover:underline" href="/admin/users">
                Users
              </a>
            </nav>
            {/* Simple profile menu (email + sign out) */}
            <details className="relative">
              <summary className="list-none flex items-center gap-2 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-white text-xs">
                  {initials}
                </span>
                <span
                  className="hidden sm:block max-w-[160px] truncate"
                  title={email}
                >
                  {email}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                <div className="px-4 py-3 text-sm">
                  <p className="font-medium text-gray-900">{name || email}</p>
                  {name ? (
                    <p className="text-gray-500 truncate" title={email}>
                      {email}
                    </p>
                  ) : null}
                </div>
                <div className="border-t border-gray-200">
                  <a
                    href="/account/logout"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
