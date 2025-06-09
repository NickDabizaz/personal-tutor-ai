"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [mobileNav, setMobileNav] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const toggleFaq = (idx: number) => setFaqOpen(faqOpen === idx ? null : idx);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ];

  const faqs = [
    {
      q: "Who is Course AI for?",
      a: "Course AI serves lifelong learners, students, and busy professionals who need a flexible, personalised learning roadmap backed by real-time AI mentorship.",
    },
    {
      q: "What’s included in the Free plan?",
      a: "The Free plan lets you build one custom course with core lessons, quizzes, and chat support—perfect for testing the waters before upgrading.",
    },
    {
      q: "How does the Pro plan accelerate progress?",
      a: "Pro unlocks unlimited courses, advanced analytics, downloadable certificates, and priority AI responses so you can blitz through skills twice as fast.",
    },
    {
      q: "Do I keep access if I cancel?",
      a: "You retain read-only access to completed courses and certificates even after cancellation—your hard work stays yours.",
    },
  ];

  return (
    <main className="font-sans bg-gray-950 text-gray-100 antialiased selection:bg-amber-400/30">
      {/* Navbar */}
      {/* ───────── Navbar ───────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-gray-950/70 border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between px-6 md:px-12 h-16">
          <a href="#" className="font-bold text-lg text-white">
            Course AI
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-amber-400">
                {l.label}
              </a>
            ))}
            <a
              href="#pricing"
              className="px-4 py-2 rounded-lg bg-amber-400 text-gray-900 font-semibold hover:bg-amber-300 transition"
            >
              Get Started
            </a>
          </nav>
          <button
            className="md:hidden"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle navigation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {mobileNav ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 8h16M4 16h16"
                />
              )}
            </svg>
          </button>
        </div>
        {mobileNav && (
          <div className="md:hidden bg-gray-950 border-t border-gray-800">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileNav(false)}
                className="block px-6 py-3 border-b border-gray-800 hover:bg-gray-900"
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </header>
      {/* ───────── Hero ─────────────────────────────── */}
      <section className="relative flex items-center justify-center min-h-[90vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/dark-grid.svg')] opacity-10 bg-cover bg-center pointer-events-none"
          aria-hidden
        />
        <div className="absolute -left-40 -top-32 w-[640px] h-[640px] bg-amber-500 rounded-full blur-3xl opacity-20" />
        <div className="container relative z-10 px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 max-w-4xl mx-auto">
            No Limits. No Excuses.
            <br className="hidden md:block" />
            <span className="text-amber-400">Master Any Skill</span> with AI.
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-gray-300">
            Course AI is your personal AI tutor—designing custom courses,
            pushing you with interactive challenges, and keeping you accountable
            from day one to done.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#pricing"
              className="px-8 py-3 rounded-xl bg-amber-400 text-gray-900 font-semibold shadow-lg hover:bg-amber-300 transition"
            >
              Start My Journey
            </a>
            <a
              href="#how"
              className="px-8 py-3 rounded-xl border border-amber-400 text-amber-400 font-semibold hover:bg-amber-400/10 transition"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Storytelling Offer ───────────────── */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          {/* Content - Left Side */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              From Idea to Expertise—
              <span className="text-amber-400">10× Faster</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Traditional courses force you to adapt to their pace. Course AI
              flips the script—adapting to yours. Our AI analyses your goals,
              designs a curriculum around your schedule, and delivers bite-size
              milestones that build unstoppable momentum.
            </p>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="text-amber-400">✓</span> Evidence-based
                micro-learning keeps focus high and burnout low.
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400">✓</span> Smart reminders nudge
                you just before procrastination strikes.
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400">✓</span> Real-time chat tutor
                simplifies complex topics the moment confusion appears.
              </li>
            </ul>
          </div>
          
          {/* Image - Right Side */}
          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-2xl w-4/5 mx-auto">
            <div className="rounded-2xl overflow-hidden bg-gray-900 aspect-square relative">
              <Image
                src="/dashboard-preview.png"
                alt="Course AI dashboard preview"
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Features & Benefits ─────────────── */}
      <section id="features" className="py-24 bg-gray-950">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Learners Choose Course AI
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "AI‑Assisted Course Creation",
                desc: "Generate a tailor‑made curriculum in seconds—no guesswork, just action.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                ),
              },
              {
                title: "Adaptive Learning Engine",
                desc: "Lessons calibrate to your performance so progress is always challenging yet achievable.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6l4 2"
                  />
                ),
              },
              {
                title: "Interactive Quizzes & Projects",
                desc: "Reinforce theory with practical tasks and instant, AI‑generated feedback.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4"
                  />
                ),
              },
              {
                title: "Verified Certificates",
                desc: "Celebrate each milestone with shareable certificates backed by blockchain hashing.",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9a2 2 0 012-2h2"
                  />
                ),
              },
            ].map(({ title, desc, icon }, i) => (
              <div
                key={i}
                className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:shadow-xl transition"
              >
                <div className="mb-4 w-12 h-12 flex items-center justify-center bg-gray-800 rounded-xl text-amber-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    {icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── How It Works ─────────────────────── */}
      <section id="how" className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
            {[
              {
                step: "1",
                title: "Set Your Goal",
                desc: "Tell Course AI what you want to master—no matter the topic.",
              },
              {
                step: "2",
                title: "AI Builds Your Path",
                desc: "Get a personalised course structure, instantly.",
              },
              {
                step: "3",
                title: "Learn & Get Certified",
                desc: "Progress with interactive AI, quizzes, and milestones.",
              },
            ].map(({ step, title, desc }, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <span className="w-14 h-14 flex items-center justify-center rounded-full bg-amber-400 text-gray-900 text-xl font-bold">
                  {step}
                </span>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-gray-400 text-sm max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Pricing ───────────────────────────── */}
      <section id="pricing" className="py-24 bg-gray-950">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Choose Your Plan
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Whether you&apos;re just getting started or ready to
            accelerate—there&apos;s a plan for you.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                features: [
                  "1 custom course",
                  "Basic AI assistant",
                  "Community access",
                ],
                cta: "Start Free",
                highlight: false,
              },
              {
                name: "Pro",
                price: "$29/mo",
                features: [
                  "Unlimited courses",
                  "Priority AI chat",
                  "Certificates & reports",
                  "Advanced analytics",
                ],
                cta: "Upgrade Now",
                highlight: true,
              },
            ].map(({ name, price, features, cta, highlight }, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-8 ${
                  highlight
                    ? "bg-gray-900 border-amber-400 shadow-lg scale-105"
                    : "bg-gray-900 border-gray-800"
                }`}
              >
                <h3 className="text-xl font-semibold mb-2">{name}</h3>
                <p className="text-3xl font-bold text-amber-400 mb-4">
                  {price}
                </p>
                <ul className="space-y-2 text-gray-300 text-sm mb-6">
                  {features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="inline-block text-center px-6 py-3 rounded-xl bg-amber-400 text-gray-900 font-semibold hover:bg-amber-300 transition"
                >
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ ─────────────────────────────── */}
      <section id="faq" className="py-24 bg-gray-900">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-800 pb-4">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex justify-between items-center w-full text-left text-lg font-medium text-gray-100"
                >
                  {faq.q}
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      faqOpen === idx ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {faqOpen === idx && (
                  <p className="mt-3 text-sm text-gray-400">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 border-t border-gray-800">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Course AI</h3>
            <p className="text-sm max-w-xs">
              Smarter, faster learning—powered by AI and designed for humans.
            </p>
          </div>
          <nav className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="text-white font-semibold mb-1">Product</h4>
              <ul className="space-y-1">
                <li>
                  <a href="#features" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">Company</h4>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">Legal</h4>
              <ul className="space-y-1">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <p className="mt-12 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Course AI. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
