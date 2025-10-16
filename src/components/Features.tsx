import Image from "next/image";

const features = [
  {
    title: "Member Management",
    description:
      "Comprehensive member database with profiles, contributions, and activity tracking.",
    icon: (
      <svg
        className="h-8 w-8 text-[--color-lemon-700]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
    ),
  },
  {
    title: "Financial Tracking",
    description:
      "Real-time financial monitoring with automated reporting and analytics.",
    icon: (
      <svg
        className="h-8 w-8 text-[--color-lemon-700]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "Loan Management",
    description:
      "Streamlined loan processing with automated approvals and payment tracking.",
    icon: (
      <svg
        className="h-8 w-8 text-[--color-lemon-700]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    title: "Asset Management",
    description:
      "Track and manage cooperative assets with detailed inventory and valuation.",
    icon: (
      <svg
        className="h-8 w-8 text-[--color-lemon-700]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    title: "Payment Processing",
    description:
      "Secure payment gateway integration with multiple payment options.",
    icon: (
      <svg
        className="h-8 w-8 text-[--color-lemon-700]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    title: "Reporting & Analytics",
    description:
      "Comprehensive reports and insights to drive informed decision making.",
    icon: (
      <svg
        className="h-8 w-8 text-[--color-lemon-700]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Everything You Need to Manage Your Cooperative
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features
            needed to efficiently manage your cooperative operations.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-[--color-lemon-100] rounded-lg mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Analytics Preview */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-[--color-lemon-600] to-[--color-lemon-700] rounded-2xl p-8 text-gray-900">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">
                  Real-time Analytics Dashboard
                </h3>
                <p className="text-gray-800 mb-6">
                  Get instant insights into your cooperative&apos;s performance
                  with our comprehensive analytics dashboard.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="text-2xl font-bold">1,250+</div>
                    <div className="text-sm text-gray-700">Active Members</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <div className="text-2xl font-bold">₦2.5M</div>
                    <div className="text-sm text-gray-700">Total Assets</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="/chart.jpg"
                  alt="Analytics dashboard preview"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
