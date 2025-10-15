import TenantSignupForm from "@/components/TenantSignupForm";

export const metadata = {
  title: "Create your cooperative | ValidCoop",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create your cooperative
          </h1>
          <p className="text-gray-600">Start your 30-day free trial</p>
        </div>
        <TenantSignupForm />
      </div>
    </div>
  );
}
