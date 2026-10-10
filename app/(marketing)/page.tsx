import { ChartNoAxesColumn, Calendar, Clock, Languages, Sparkle, TrendingUp } from "lucide-react";
import { ButtonLink, LinkCard, SkipLink } from "@/components/ui";
import { PublicFooter, PublicHeader } from "@/components/marketing/public-header";
import { SampleResultCard } from "@/components/marketing/sample-result-card";

/* ------------------------------------------------------------------ */
/* Content (design: index.html)                                        */
/* ------------------------------------------------------------------ */

const EXAMS = [
  {
    code: "CGL",
    name: "SSC CGL",
    text: "Tier 1 style full mocks across Quantitative Aptitude, Reasoning, English and General Awareness.",
    tile: "bg-indigo-100 text-indigo-900",
  },
  {
    code: "CHSL",
    name: "SSC CHSL",
    text: "Speed and accuracy practice built for the 10+2 level exam.",
    tile: "bg-teal-100 text-teal-800",
  },
  {
    code: "BANK",
    name: "Banking exams",
    text: "IBPS PO and clerk-style sectional tests, including reasoning and data interpretation.",
    tile: "bg-warn-bg text-warn-fg",
  },
  {
    code: "RRB",
    name: "Railway exams",
    text: "NTPC practice sets with topic tests to fix weak areas fast.",
    tile: "bg-pink-bg text-pink-fg",
  },
];

const BENEFITS = [
  { icon: Clock, title: "Real exam interface", text: "Timer, question palette, mark for review. No surprises on exam day." },
  {
    icon: ChartNoAxesColumn,
    title: "Instant, detailed results",
    text: "Section accuracy, time spent and a full question review as soon as you submit.",
  },
  {
    icon: TrendingUp,
    title: "Percentile ranking",
    text: "See how you compare with other students preparing for the same exam.",
  },
  {
    icon: Sparkle,
    title: "Fresh questions every time",
    text: "Expert-reviewed questions, so you practise new problems instead of repeating the same ones.",
  },
  {
    icon: Calendar,
    title: "Book, change, resume",
    text: "Pick a slot that suits you, reschedule easily, and resume if your connection drops.",
  },
  { icon: Languages, title: "English and Hindi", text: "Practise in the language you are most comfortable in." },
];

const STEPS = [
  {
    title: "Create your free account",
    text: "Add your name, email and the exam you are preparing for. Studying at an institute? Add your institute code.",
  },
  { title: "Book a slot", text: "Choose a mock test and a time that works. Change it later if plans change." },
  {
    title: "Take the test, get your plan",
    text: "Sit the exam, see your score and percentile instantly, and get topics to practise next.",
  },
];

const FAQ = [
  {
    q: "Are the SSC CGL mock tests really free?",
    a: "Yes. Every student gets free starter mock tests with instant results and answers. Pro adds unlimited full-length mocks, percentile ranking and smart practice.",
  },
  {
    q: "How is this different from a PDF test series?",
    a: "You practise on a real exam-style interface with a timer and question palette, and you get instant analysis of your accuracy by section and topic.",
  },
  {
    q: "Can I reschedule an exam I booked?",
    a: "Yes. Open My schedule, choose a new slot and save. You can change or cancel up to 2 hours before the start time.",
  },
  {
    q: "I study at a coaching institute. How do I sign in?",
    a: "Use the email and password your institute gave you, or add your institute code when you register. You will see your institute's exams and branding.",
  },
  {
    q: "Does it work on my phone?",
    a: "Yes. The platform works on phones, tablets and laptops. For full-length mocks we recommend a larger screen.",
  },
  {
    q: "I run a coaching institute. Can I use this for my students?",
    a: "Yes. Institutes get an admin console to create exams, generate and approve questions, manage batches and track student progress under their own brand.",
  },
];

/** Pro price in rupees. Until it's decided (PLAN.md question 3) no placeholder is shown. */
const PRO_PRICE = process.env.NEXT_PUBLIC_PRO_PRICE_INR?.trim();

const WHATSAPP_SHARE =
  "https://wa.me/?text=Free%20SSC%20CGL%20mock%20tests%20with%20instant%20results%20on%20Pariksha%20Studio";

/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="bg-public text-ink">
      <SkipLink />
      <PublicHeader />

      <main id="main">
        {/* Hero */}
        <section aria-labelledby="hero-h" className="overflow-hidden text-white" style={{ background: "var(--ps-gradient-hero)" }}>
          <div className="mx-auto flex max-w-public flex-wrap items-center gap-12 px-4 pt-12 pb-14 sm:px-6 lg:pt-[72px] lg:pb-20">
            <div className="min-w-0 flex-[1_1_460px]">
              <p className="chip chip-amber m-0 mb-5 px-3.5 py-1.5 text-sm">Free starter mock test, no card needed</p>
              <h1 id="hero-h" className="m-0 mb-5 text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-display">
                Free SSC CGL mock tests that feel like the real exam.
              </h1>
              <p className="m-0 mb-8 max-w-[560px] text-lg leading-relaxed text-indigo-150 sm:text-xl">
                Practise on an exam-style interface, get instant results with percentile, and learn exactly what to fix
                next. Book a slot, sit the test, improve your rank.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <ButtonLink href="/sign-up" variant="amber" size="xl">
                  Take a free mock test
                </ButtonLink>
                <a href="#how" className="btn btn-ghost btn-xl">
                  See how it works
                </a>
              </div>
              <ul className="m-0 mt-7 flex list-none flex-wrap gap-x-6 gap-y-2.5 p-0 text-[15px] text-on-dark-soft">
                <li>✓ English and Hindi</li>
                <li>✓ Instant results</li>
                <li>✓ Works on phone and laptop</li>
              </ul>
            </div>
            <div className="flex min-w-0 flex-[1_1_380px] justify-center">
              <SampleResultCard />
            </div>
          </div>
        </section>

        {/* Exams */}
        <section id="exams" className="section scroll-mt-4" aria-labelledby="ex-h">
          <p className="eyebrow">Mock tests for every exam</p>
          <h2 id="ex-h" className="section-title">
            Prepare for the exam you are aiming for
          </h2>
          <p className="section-lead">
            Pick your exam and practise with full-length mocks, sectional tests and topic tests, all in the style of the
            real paper.
          </p>
          <div className="flex flex-wrap gap-5">
            {EXAMS.map((exam) => (
              <LinkCard key={exam.code} href="/sign-up" size="lg" className="flex flex-[1_1_250px] flex-col gap-2">
                <div className={`icon-tile ${exam.tile}`} aria-hidden="true">
                  {exam.code}
                </div>
                <h3 className="m-0 mt-2 text-xl font-extrabold">{exam.name}</h3>
                <p className="m-0 text-[15px] leading-relaxed text-muted">{exam.text}</p>
                <span className="mt-auto pt-2 font-extrabold text-indigo-800">Start practising →</span>
              </LinkCard>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section aria-labelledby="bn-h" className="border-y border-line bg-surface">
          <div className="section">
            <p className="eyebrow">Why students choose Pariksha Studio</p>
            <h2 id="bn-h" className="section-title">
              Practise smarter, not just longer
            </h2>
            <p className="section-lead">
              Every feature is built to answer one question: what should I do next to score higher?
            </p>
            <div className="flex flex-wrap gap-5">
              {BENEFITS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex flex-[1_1_320px] gap-4">
                  <div className="icon-tile bg-indigo-50" aria-hidden="true">
                    <Icon className="size-6 text-indigo-800" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="m-0 mb-1 text-lg font-extrabold">{title}</h3>
                    <p className="m-0 leading-relaxed text-muted">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="section scroll-mt-4" aria-labelledby="hw-h">
          <p className="eyebrow">How it works</p>
          <h2 id="hw-h" className="section-title">
            From sign-up to your first result in 3 steps
          </h2>
          <p className="section-lead">
            No downloads. No confusion. Choose a time that works for you and we keep a seat ready.
          </p>
          <ol className="m-0 flex list-none flex-wrap gap-5 p-0">
            {STEPS.map((step, index) => (
              <li key={step.title} className="card card-lg flex-[1_1_280px]">
                <div
                  className="mb-3.5 flex size-11 items-center justify-center rounded-pill bg-indigo-800 text-lg font-extrabold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </div>
                <h3 className="m-0 mb-1.5 text-xl font-extrabold">{step.title}</h3>
                <p className="m-0 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <ButtonLink href="/sign-up" variant="primary" size="xl">
              Create my free account
            </ButtonLink>
          </div>
        </section>

        {/* Two paths */}
        <section aria-labelledby="two-h" className="border-y border-line bg-surface">
          <div className="section">
            <p className="eyebrow">Studying on your own or with a coaching institute</p>
            <h2 id="two-h" className="section-title">
              One platform, whichever way you prepare
            </h2>
            <p className="section-lead">
              Independent learners join free. Students of partner institutes sign in with their institute account and see
              their institute&apos;s exams and branding.
            </p>
            <div className="flex flex-wrap gap-5">
              <div className="card card-lg flex-[1_1_380px] border-t-[6px] border-t-indigo-800">
                <h3 className="m-0 mb-2 text-[22px] font-extrabold">I&apos;m studying on my own</h3>
                <p className="m-0 mb-5 leading-relaxed text-muted">
                  Create a free account, take starter mocks, and upgrade to Pro when you want full-length exams and
                  percentile.
                </p>
                <ButtonLink href="/sign-up" variant="primary" size="xl">
                  Create free account
                </ButtonLink>
              </div>
              <div className="card card-lg flex-[1_1_380px] border-t-[6px] border-t-teal-700">
                <h3 className="m-0 mb-2 text-[22px] font-extrabold">I study at a coaching institute</h3>
                <p className="m-0 mb-5 leading-relaxed text-muted">
                  Sign in with the account your institute gave you, or add your institute code when you register. Your
                  exams are already waiting.
                </p>
                <ButtonLink
                  href="/sign-in"
                  variant="outline"
                  size="xl"
                  className="border-teal-200 text-teal-800 hover:bg-teal-50 hover:text-teal-800"
                >
                  Sign in with institute account
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="section scroll-mt-4" aria-labelledby="pr-h">
          <p className="eyebrow">Simple pricing</p>
          <h2 id="pr-h" className="section-title">
            Start free. Upgrade when you are ready.
          </h2>
          <p className="section-lead">No hidden charges. Cancel any time.</p>
          <div className="flex flex-wrap items-stretch gap-5">
            <div className="card card-lg flex flex-[1_1_340px] flex-col gap-3">
              <h3 className="m-0 text-[22px] font-extrabold">Free</h3>
              <div className="text-4xl font-extrabold">₹0</div>
              <ul className="m-0 pl-5 leading-[1.9] text-ink-soft">
                <li>Free starter mock tests</li>
                <li>Instant score and answers</li>
                <li>Book and reschedule slots</li>
              </ul>
              <ButtonLink href="/sign-up" variant="outline" size="xl" className="mt-auto">
                Start free
              </ButtonLink>
            </div>
            <div className="card card-lg relative flex flex-[1_1_340px] flex-col gap-3 border-[3px] border-indigo-800">
              <span className="chip chip-amber absolute -top-3.5 left-6 px-3 text-[13px]">Most popular</span>
              <h3 className="m-0 text-[22px] font-extrabold">Pro</h3>
              {PRO_PRICE ? (
                <div className="text-4xl font-extrabold">
                  ₹{PRO_PRICE}
                  <span className="text-base font-semibold text-muted"> / month</span>
                </div>
              ) : (
                <div className="text-2xl font-extrabold text-muted">Pricing coming soon</div>
              )}
              <ul className="m-0 pl-5 leading-[1.9] text-ink-soft">
                <li>Unlimited full-length mocks</li>
                <li>Percentile and rank analysis</li>
                <li>Smart practice on weak topics</li>
                <li>Detailed solutions</li>
              </ul>
              <ButtonLink href="/sign-up" variant="primary" size="xl" className="mt-auto">
                Start free, upgrade later
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Institutes band */}
        <section id="institutes" aria-labelledby="in-h" className="scroll-mt-4 bg-night text-white">
          <div className="section flex flex-wrap items-center gap-10">
            <div className="flex-[1_1_440px]">
              <p className="eyebrow text-teal-300">For coaching institutes and schools</p>
              <h2 id="in-h" className="section-title">
                Run your own mock exams under your own brand
              </h2>
              <p className="m-0 mb-6 text-lg leading-relaxed text-night-text">
                Generate exam-style questions with AI, review them as an expert, schedule exams with seat limits, and see
                every student&apos;s progress. Your logo, colours and sign-in, on one platform.
              </p>
              <ul className="m-0 mb-7 grid list-none gap-2.5 p-0 text-on-dark-soft">
                <li>✓ AI question studio with expert approval</li>
                <li>✓ Batches, schedules and seat limits</li>
                <li>✓ Student history and analytics</li>
                <li>✓ Single sign-on and your own branding</li>
              </ul>
              <ButtonLink href="/sign-in" variant="amber" size="xl">
                Institute sign in
              </ButtonLink>
            </div>
            <div className="flex-[1_1_320px] rounded-hero bg-night-card p-7">
              <div className="mb-3 text-lg font-extrabold">Built for how institutes work</div>
              <p className="m-0 leading-[1.7] text-night-text">
                Add students by email or CSV. Assign exams to a batch. Reschedule when plans change, and students are told
                automatically.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="section max-w-faq scroll-mt-4" aria-labelledby="fq-h">
          <p className="eyebrow">Questions, answered</p>
          <h2 id="fq-h" className="section-title">
            Frequently asked questions
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {FAQ.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section aria-labelledby="cta-h" className="text-center text-white" style={{ background: "var(--ps-gradient-cta)" }}>
          <div className="mx-auto max-w-[760px] px-4 py-14 sm:px-6 sm:py-[72px]">
            <h2 id="cta-h" className="m-0 mb-3 text-[30px] leading-[1.15] font-extrabold tracking-[-0.02em] sm:text-[38px]">
              Your next mock test is one click away.
            </h2>
            <p className="m-0 mb-7 text-lg leading-relaxed text-on-dark-soft">
              Create a free account, book a slot and see where you stand today.
            </p>
            <div className="flex flex-wrap justify-center gap-3.5">
              <ButtonLink href="/sign-up" variant="amber" size="xl">
                Start free
              </ButtonLink>
              <a href={WHATSAPP_SHARE} className="btn btn-ghost btn-xl" target="_blank" rel="noopener noreferrer">
                Share with a friend on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
