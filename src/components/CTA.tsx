import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-[--color-lemon-600] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Ready to Transform Your Cooperative?
        </h2>
        <p className="text-xl text-gray-800 mb-8 max-w-3xl mx-auto">
          Join hundreds of cooperatives already using ValidCoop to streamline
          their operations and grow their membership.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-white text-[--color-lemon-800] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="#contact"
            className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-900 hover:text-white transition-colors"
          >
            Schedule Demo
          </Link>
        </div>
        <p className="text-gray-800 text-sm mt-4">
          No credit card required • 30-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
