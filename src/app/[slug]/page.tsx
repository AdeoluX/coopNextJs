import LoginForm from "@/components/LoginForm";

async function getTenant(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/auth/tenant-by-slug/${slug}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data || null;
}

export default async function TenantLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const tenant = await getTenant(resolvedParams.slug);

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900">Tenant not found</h1>
          <p className="mt-2 text-gray-600">
            Check the URL or contact your cooperative admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>
        <LoginForm orgId={tenant.id} slug={resolvedParams.slug} />
      </div>
    </div>
  );
}
