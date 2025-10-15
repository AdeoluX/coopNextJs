import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-[--color-lemon-50] to-[--color-lemon-100] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Empower Your
              <span className="text-[--color-lemon-700]"> Cooperative</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 leading-relaxed">
              Modern technology solutions for cooperatives. Streamline
              operations, enhance member engagement, and drive growth with our
              comprehensive platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/signup"
                className="bg-[--color-lemon-600] text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[--color-lemon-700] transition-colors text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="#features"
                className="border-2 border-[--color-lemon-600] text-[--color-lemon-700] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[--color-lemon-50] transition-colors text-center"
              >
                Learn More
              </Link>
            </div>
            <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Free 30-day trial
              </div>
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                No setup fees
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/cooperative.jpg"
                alt="Cooperative members working together"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-[--color-lemon-300] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-[--color-lemon-200] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
