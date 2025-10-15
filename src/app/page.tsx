import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTA />
        <div className="text-center py-12">
          <p className="text-gray-600">Already have a cooperative?</p>
          <p className="mt-2">
            <Link
              href="/valid-coop"
              className="text-[--color-lemon-700] underline"
            >
              Go to your login via slug
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
