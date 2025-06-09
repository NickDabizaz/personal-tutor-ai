"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

// Intersection Observer Hook
function useScrollAnimation() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            
            // Handle stagger animations for children
            const children = entry.target.querySelectorAll('.animate-on-scroll');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animate');
              }, index * 100);
            });
          }
        });
      },
      observerOptions
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

export default function Home() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const toggleFaq = (idx: number) => setFaqOpen(faqOpen === idx ? null : idx);

  // Initialize scroll animations
  useScrollAnimation();

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
      a: "The Free plan lets you build one custom course with core lessons, quizzes, and chat support. Perfect for testing the waters before upgrading.",
    },
    {
      q: "How does the Pro plan accelerate progress?",
      a: "Pro unlocks unlimited courses, advanced analytics, downloadable certificates, and priority AI responses so you can blitz through skills twice as fast.",
    },
    {
      q: "Do I keep access if I cancel?",
      a: "You retain read-only access to completed courses and certificates even after cancellation. Your hard work stays yours.",
    },
  ];

  return (
    <main className="font-sans bg-gray-950 text-gray-100 antialiased selection:bg-amber-400/30">
      <Header navLinks={navLinks} />
      {/* ───────── Hero ─────────────────────────────── */}
      <section className="relative flex items-center justify-center min-h-[90vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-[url('/dark-grid.svg')] opacity-10 bg-cover bg-center pointer-events-none"
          aria-hidden
        />
        <div className="absolute -left-40 -top-32 w-[640px] h-[640px] bg-amber-500 rounded-full blur-3xl opacity-20" />
        <div className="container relative z-10 px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 max-w-4xl mx-auto animate-fade-in">
            No Limits. No Excuses.
            <br className="hidden md:block" />
            <span className="text-amber-400 inline-block animate-slide-down animation-delay-300">Master Any Skill</span> with AI.
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg md:text-xl text-gray-300 animate-slide-up animation-delay-500">
            Course AI is your personal AI tutor that designs custom courses,
            pushing you with interactive challenges, and keeping you accountable
            from day one to done.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in animation-delay-700">
            <a
              href="#pricing"
              className="px-8 py-3 rounded-xl bg-amber-400 text-gray-900 font-semibold shadow-lg hover:bg-amber-300 hover:scale-105 hover:shadow-xl transition-all duration-300"
            >
              Start My Journey
            </a>
            <a
              href="#how"
              className="px-8 py-3 rounded-xl border border-amber-400 text-amber-400 font-semibold hover:bg-amber-400/10 hover:scale-105 transition-all duration-300"
            >
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Storytelling Offer ───────────────── */}
      <section className="py-24 bg-gray-900 animate-on-scroll">
        <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
          {/* Content - Left Side */}
          <div className="animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              From Idea to Expertise
              <br />
              <span className="text-amber-400">10× Faster</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Traditional courses force you to adapt to their pace. Course AI
              flips the script by adapting to yours. Our AI analyses your goals,
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
          <div className="bg-gray-800 p-6 rounded-3xl border border-gray-700 shadow-2xl w-4/5 mx-auto animate-on-scroll">
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
      <section id="features" className="py-24 bg-gray-950 animate-on-scroll">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-on-scroll">
            Why Learners Choose Course AI
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "AI‑Assisted Course Creation",
                desc: "Generate a tailor‑made curriculum in seconds. No guesswork, just action.",
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
                className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:shadow-xl transition animate-on-scroll card-hover"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="mb-6 w-16 h-16 flex items-center justify-center bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-2xl text-amber-400 shadow-lg shadow-amber-500/10 border border-amber-500/20">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    {icon}
                  </svg>
                </div>
                <h3 className="font-semibold text-xl mb-3 flex items-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{title}</span>
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── How It Works ─────────────────────── */}
      <section id="how" className="py-24 bg-gray-900 animate-on-scroll">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-on-scroll">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
            {[
              {
                step: "1",
                title: "Set Your Goal",
                desc: "Tell Course AI what you want to master, no matter the topic.",
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
              <div key={i} className="flex flex-col items-center gap-4 animate-on-scroll" style={{ animationDelay: `${i * 0.2}s` }}>
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
      <section id="pricing" className="py-24 bg-gray-950 animate-on-scroll">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 animate-on-scroll">
            Choose Your Plan
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto animate-on-scroll">
            Whether you&apos;re just getting started or ready to
            accelerate, there&apos;s a plan for you.
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
                className={`rounded-2xl border p-8 animate-on-scroll card-hover relative ${
                  highlight
                    ? "bg-gray-900 border-amber-400 shadow-lg scale-105"
                    : "bg-gray-900 border-gray-800"
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {highlight && (
                  <span className="absolute -top-3 right-8 bg-amber-400 text-gray-900 text-xs font-bold py-1 px-4 rounded-full shadow-lg">
                    RECOMMENDED
                  </span>
                )}
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
      <section id="faq" className="py-24 bg-gray-900 animate-on-scroll">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-on-scroll">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-800 pb-4 animate-on-scroll" style={{ animationDelay: `${idx * 0.1}s` }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex justify-between items-center w-full text-left text-lg font-medium text-gray-100 hover:text-amber-400 transition-colors py-2"
                >
                  <span className={`transition-colors duration-300 ${faqOpen === idx ? 'text-amber-400' : ''}`}>{faq.q}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${faqOpen === idx ? 'bg-amber-400' : 'bg-gray-800'}`}>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        faqOpen === idx ? "rotate-180 text-gray-900" : "text-gray-400"
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
                  </div>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ 
                    maxHeight: faqOpen === idx ? '200px' : '0px',
                    opacity: faqOpen === idx ? 1 : 0,
                    marginTop: faqOpen === idx ? '0.75rem' : '0'
                  }}
                >
                  <p className="text-sm text-gray-400 pl-1 border-l-2 border-amber-400/30">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
