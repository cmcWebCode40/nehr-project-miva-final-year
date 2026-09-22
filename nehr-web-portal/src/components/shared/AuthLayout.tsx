import { AuthBrandPanel } from "./AuthBrandPanel";

export function AuthLayout({
  headline,
  subtext,
  children,
}: {
  headline: [string, string];
  subtext: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white p-4 lg:flex lg:items-stretch lg:gap-4">
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <div className="hidden w-full max-w-[45%] lg:block">
        <AuthBrandPanel headline={headline} subtext={subtext} />
      </div>
    </div>
  );
}
