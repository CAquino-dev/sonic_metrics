import { useEffect } from "react";
import {
  animate,
  createTimeline,
  createScope,
  stagger,
  utils,
} from "animejs";
import { useAuth } from "../hooks/useAuth";

export default function Landing() {
  const { login } = useAuth();

  useEffect(() => {
    const scope = createScope({ root: document.body }).add(() => {
      const observers: IntersectionObserver[] = [];

      const animateOnScroll = (
        animation: ReturnType<typeof animate>,
        target: string,
        threshold = 0.15
      ) => {
        animation.pause();

        const element = document.querySelector(target);

        if (!element) {
          animation.play();
          return;
        }

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) {
              return;
            }

            animation.play();
            observer.disconnect();
          },
          {
            threshold,
          }
        );

        observer.observe(element);
        observers.push(observer);
      };

      // ============================================================
      // 1. HERO ENTRANCE TIMELINE
      // ============================================================
      const heroTl = createTimeline();

      heroTl
        .add(".hero-eyebrow", {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          easing: "easeOutExpo",
        })
        .add(
          ".hero-line",
          {
            opacity: [0, 1],
            translateY: [60, 0],
            rotate: () => utils.random(-2, 2),
            duration: 900,
            easing: "easeOutExpo",
            delay: stagger(140),
          },
          "-=400"
        )
        .add(
          ".hero-sub",
          {
            opacity: [0, 1],
            translateY: [24, 0],
            duration: 900,
            easing: "easeOutExpo",
            delay: stagger(100),
          },
          "-=500"
        )
        .add(
          ".hero-punch",
          {
            opacity: [0, 1],
            translateX: [-16, 0],
            duration: 900,
            easing: "easeOutExpo",
            delay: stagger(120),
          },
          "-=500"
        )
        .add(
          ".hero-cta",
          {
            opacity: [0, 1],
            translateY: [20, 0],
            scale: [0.95, 1],
            duration: 900,
            easing: "easeOutExpo",
          },
          "-=400"
        );

      // ============================================================
      // 2. FLOATING DECORATIVE BLOCKS
      // ============================================================
      animate(".float-block", {
        translateY: [
          { to: -10, duration: 1600 },
          { to: 0, duration: 1600 },
        ],
        rotate: [
          { to: "-=4", duration: 1600 },
          { to: "+=4", duration: 1600 },
        ],
        loop: true,
        alternate: true,
        easing: "easeInOutSine",
        delay: stagger(220),
      });

      // ============================================================
      // 3. MARQUEE
      // ============================================================
      animate(".marquee-track", {
        translateX: ["0%", "-50%"],
        duration: 28000,
        loop: true,
        easing: "linear",
      });

      // ============================================================
      // 4. SECTION HEADERS
      // ============================================================
      const sectionHeadingAnimation = animate(".section-heading", {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 900,
        easing: "easeOutExpo",
        delay: stagger(120),
        autoplay: false,
      });

      animateOnScroll(sectionHeadingAnimation, "#visualized");

      // ============================================================
      // 5. VISUALIZATION FEATURE LIST
      // ============================================================
      const vizAnimation = animate(".viz-item", {
        opacity: [0, 1],
        translateX: [-30, 0],
        duration: 700,
        easing: "easeOutExpo",
        delay: stagger(90, { start: 200 }),
        autoplay: false,
      });

      animateOnScroll(vizAnimation, ".viz-list");

      // ============================================================
      // 6. FIND YOUR SOUND
      // ============================================================
      const soundAnimation = animate(".sound-para", {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 900,
        easing: "easeOutExpo",
        delay: stagger(150),
        autoplay: false,
      });

      animateOnScroll(soundAnimation, ".sound-section");

      // ============================================================
      // 7. STEPS
      // ============================================================
      const stepNumberAnimation = animate(".step-number", {
        opacity: [0, 1],
        scale: [0.5, 1],
        rotate: [12, 0],
        duration: 700,
        easing: "easeOutBack",
        delay: stagger(180),
        autoplay: false,
      });

      animateOnScroll(stepNumberAnimation, ".steps-section");

      const stepCardAnimation = animate(".step-card", {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 900,
        easing: "easeOutExpo",
        delay: stagger(180, { start: 300 }),
        autoplay: false,
      });

      animateOnScroll(stepCardAnimation, ".steps-section");

      // ============================================================
      // 8. FINAL CTA
      // ============================================================
      const finalCtaAnimation = animate(".final-cta", {
        opacity: [0, 1],
        scale: [0.92, 1],
        rotate: [-1.5, 0],
        duration: 1100,
        easing: "easeOutExpo",
        autoplay: false,
      });

      animateOnScroll(finalCtaAnimation, ".final-section");

      // ============================================================
      // 9. DECORATIVE BAR WIDTHS
      // ============================================================
      const growBars = document.querySelectorAll<HTMLElement>(".grow-bar");

      growBars.forEach((bar, index) => {
        const targetWidth = bar.dataset.width ?? "100%";

        const animation = animate(bar, {
          width: [0, targetWidth],
          duration: 1400,
          easing: "easeOutExpo",
          delay: index * 120,
          autoplay: false,
        });

        if (index === 0) {
          animateOnScroll(animation, ".grow-bars");
        }
      });

      // ============================================================
      // CLEANUP
      // ============================================================
      return () => {
        observers.forEach((observer) => observer.disconnect());
      };
    });

    return () => scope.revert();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f4f2ea] relative overflow-x-hidden font-mono text-black">
      {/* Graph paper background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, #00000012 1px, transparent 1px), linear-gradient(to bottom, #00000012 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ============ HEADER ============ */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-5 border-b-2 border-black bg-[#f4f2ea]">
        <span className="text-lg sm:text-xl font-black italic tracking-tight">
          SONIC_METRICS
        </span>

        <nav className="hidden sm:flex items-center gap-8 text-xs tracking-widest text-neutral-500">
          <a href="#visualized" className="hover:text-black transition-colors">
            VISUALIZED
          </a>

          <a href="#sound" className="hover:text-black transition-colors">
            YOUR_SOUND
          </a>

          <a href="#how" className="hover:text-black transition-colors">
            HOW_IT_WORKS
          </a>
        </nav>

        <button
          onClick={login}
          className="border-2 border-black rounded-md px-3 py-1.5 text-xs font-bold bg-green-400 hover:bg-green-300 shadow-[2px_2px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          LOGIN
        </button>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative z-10 px-4 sm:px-8 pt-16 pb-24 overflow-hidden">
        {/* Floating decorative blocks */}
        <div className="float-block absolute left-4 top-28 w-20 h-12 bg-yellow-300 border-2 border-black -rotate-6 hidden md:block" />

        <div className="float-block absolute right-8 top-20 w-16 h-20 bg-green-800 border-2 border-black rotate-6 hidden md:block" />

        <div className="float-block absolute left-[42%] bottom-6 w-10 h-10 bg-blue-400 border-2 border-black rotate-12 hidden lg:block" />

        <div className="float-block absolute right-[30%] top-[55%] w-14 h-8 bg-red-400 border-2 border-black -rotate-12 hidden lg:block" />

        <div className="max-w-5xl mx-auto text-center pt-8">
          <div className="hero-eyebrow opacity-0 inline-block border-2 border-black bg-[#faf9f4] px-3 py-1 text-[10px] tracking-widest mb-8">
            v2.4.0_STABLE // AUTH_REQUIRED
          </div>

          <h1 className="font-black leading-[0.9] tracking-tight">
            <span className="hero-line block text-5xl sm:text-7xl lg:text-8xl opacity-0">
              YOUR MUSIC.
            </span>

            <span className="hero-line block text-5xl sm:text-7xl lg:text-8xl opacity-0 mt-2">
              YOUR DATA.
            </span>

            <span className="hero-line block text-5xl sm:text-7xl lg:text-8xl opacity-0 mt-2">
              <span className="bg-green-800 text-white px-3 inline-block -rotate-1">
                YOUR STORY.
              </span>
            </span>
          </h1>

          <p className="hero-sub opacity-0 mt-10 text-sm sm:text-base text-neutral-700 leading-relaxed max-w-2xl mx-auto">
            Sonic Metrics transforms your Spotify listening data into a clear,
            interactive picture of your music habits.
          </p>

          <p className="hero-sub opacity-0 mt-4 text-sm sm:text-base text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            Connect your Spotify account and explore the artists, tracks,
            genres, and listening patterns that define your sound.
          </p>

          {/* Punch lines */}
          <div className="mt-10 space-y-2">
            <div className="hero-punch opacity-0 text-sm sm:text-base font-black tracking-widest">
              SEE WHAT YOU LISTEN TO.
            </div>

            <div className="hero-punch opacity-0 text-sm sm:text-base font-black tracking-widest">
              DISCOVER HOW YOU LISTEN.
            </div>

            <div className="hero-punch opacity-0 text-sm sm:text-base font-black tracking-widest bg-yellow-300 inline-block px-3 py-1 -rotate-1">
              UNDERSTAND YOUR MUSIC.
            </div>
          </div>

          <div className="hero-cta opacity-0 mt-12 flex justify-center">
            <button
              onClick={login}
              className="flex items-center justify-center gap-3 bg-green-400 hover:bg-green-300 border-2 border-black shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-bold py-5 px-10 text-base"
            >
              <AudioWaveIcon />

              CONNECT WITH SPOTIFY

              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="relative z-10 bg-black text-white py-4 overflow-hidden border-y-2 border-black">
        <div className="marquee-track flex gap-12 whitespace-nowrap text-sm tracking-widest font-bold">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex gap-12">
              <span>★ TOP ARTISTS</span>
              <span>★ TOP TRACKS</span>
              <span>★ GENRE BREAKDOWN</span>
              <span>★ RECENTLY PLAYED</span>
              <span>★ LISTENING TRENDS</span>
              <span>★ TIME RANGES</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ SECTION: YOUR LISTENING, VISUALIZED ============ */}
      <section
        id="visualized"
        className="viz-list relative z-10 px-4 sm:px-8 py-24"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-start">
          {/* Left: heading */}
          <div className="lg:sticky lg:top-24">
            <div className="section-heading opacity-0 inline-block border-2 border-black bg-[#faf9f4] px-3 py-1 text-[10px] tracking-widest mb-6">
              01 // VISUALIZED
            </div>

            <h2 className="section-heading opacity-0 text-4xl sm:text-5xl font-black leading-tight">
              YOUR LISTENING,
              <br />

              <span className="bg-yellow-300 px-2 inline-block -rotate-1">
                VISUALIZED.
              </span>
            </h2>

            <p className="section-heading opacity-0 mt-8 text-sm text-neutral-600 leading-relaxed max-w-md">
              Stop scrolling through playlists and start understanding your
              listening habits.
            </p>

            <p className="section-heading opacity-0 mt-4 text-sm text-neutral-500 leading-relaxed max-w-md">
              Sonic Metrics turns your Spotify data into meaningful insights:
            </p>

            {/* Decorative grow bars */}
            <div className="grow-bars mt-10 space-y-2 max-w-sm">
              <div
                className="grow-bar h-3 bg-green-800 border-2 border-black"
                data-width="92%"
                style={{ width: 0 }}
              />

              <div
                className="grow-bar h-3 bg-yellow-300 border-2 border-black"
                data-width="68%"
                style={{ width: 0 }}
              />

              <div
                className="grow-bar h-3 bg-blue-400 border-2 border-black"
                data-width="48%"
                style={{ width: 0 }}
              />
            </div>
          </div>

          {/* Right: feature list */}
          <div className="space-y-4">
            <VizItem
              index="01"
              title="Top Artists"
              body="Discover the artists dominating your listening."
              accent="bg-green-400"
            />

            <VizItem
              index="02"
              title="Top Tracks"
              body="See the songs you keep coming back to."
              accent="bg-yellow-300"
            />

            <VizItem
              index="03"
              title="Genre Breakdown"
              body="Understand the genres that shape your taste."
              accent="bg-blue-400"
            />

            <VizItem
              index="04"
              title="Recently Played"
              body="See your latest listening activity."
              accent="bg-red-400"
            />

            <VizItem
              index="05"
              title="Listening Trends"
              body="Explore how your habits change over time."
              accent="bg-purple-400"
            />

            <VizItem
              index="06"
              title="Time Ranges"
              body="Compare your music across the last 4 weeks, 6 months, or all time."
              accent="bg-green-800"
              dark
            />
          </div>
        </div>
      </section>

      {/* ============ SECTION: FIND YOUR SOUND ============ */}
      <section
        id="sound"
        className="sound-section relative z-10 bg-black text-white border-y-2 border-black px-4 sm:px-8 py-24"
      >
        <div className="max-w-4xl mx-auto">
          <div className="section-heading opacity-0 inline-block border-2 border-white px-3 py-1 text-[10px] tracking-widest mb-6">
            02 // YOUR_SOUND
          </div>

          <h2 className="section-heading opacity-0 text-4xl sm:text-6xl font-black leading-tight">
            FIND YOUR
            <br />

            <span className="text-green-400">SOUND.</span>
          </h2>

          <p className="sound-para opacity-0 mt-10 text-lg sm:text-xl font-bold leading-relaxed max-w-2xl">
            Your Spotify library contains more than songs.
          </p>

          <p className="sound-para opacity-0 mt-3 text-3xl sm:text-4xl font-black leading-tight">
            It contains{" "}
            <span className="bg-green-800 text-white px-2 inline-block -rotate-1">
              patterns.
            </span>
          </p>

          <p className="sound-para opacity-0 mt-10 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
            Sonic Metrics helps surface those patterns so you can discover the
            artists, genres, and tracks that define your personal soundtrack.
          </p>

          <p className="sound-para opacity-0 mt-4 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
            Whether you're curious about your current obsession or want to see
            how your taste has evolved, your listening data tells the story.
          </p>
        </div>
      </section>

      {/* ============ SECTION: HOW IT WORKS ============ */}
      <section
        id="how"
        className="steps-section relative z-10 px-4 sm:px-8 py-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <div className="section-heading opacity-0 inline-block border-2 border-black bg-[#faf9f4] px-3 py-1 text-[10px] tracking-widest mb-6">
              03 // HOW_IT_WORKS
            </div>

            <h2 className="section-heading opacity-0 text-4xl sm:text-6xl font-black leading-tight">
              CONNECT.{" "}
              <span className="bg-yellow-300 px-2 inline-block -rotate-1">
                EXPLORE.
              </span>{" "}
              DISCOVER.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              number="01"
              title="CONNECT"
              body="Sign in securely with your Spotify account."
              accent="bg-green-400"
            />

            <StepCard
              number="02"
              title="EXPLORE"
              body="See your top artists, tracks, genres, and recent listening activity."
              accent="bg-yellow-300"
            />

            <StepCard
              number="03"
              title="DISCOVER"
              body="Find patterns in your listening and uncover what makes your taste unique."
              accent="bg-blue-400"
            />
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="final-section relative z-10 bg-[#f4f2ea] border-t-2 border-black px-4 sm:px-8 py-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="final-cta opacity-0">
            <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
              YOUR MUSIC
              <br />
              HAS A STORY.
            </h2>

            <h3 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight">
              <span className="bg-green-800 text-white px-3 inline-block -rotate-1">
                LET'S SEE WHAT IT SAYS.
              </span>
            </h3>

            <button
              onClick={login}
              className="mt-14 inline-flex items-center gap-3 bg-green-400 hover:bg-green-300 border-2 border-black shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-black py-5 px-12 text-base tracking-widest"
            >
              <AudioWaveIcon />

              CONNECT WITH SPOTIFY

              <span aria-hidden="true">&rarr;</span>
            </button>

            <div className="mt-12 grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
              <StatBox
                label="PERMISSION_LEVEL"
                value="READ_ONLY"
              />

              <StatBox
                label="DATA_ENCRYPTION"
                value="AES_256_STABLE"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 bg-black text-neutral-400 text-[11px] tracking-widest px-6 py-4">
        <span>v2.4.0_STABLE</span>

        <span className="text-center">
          DISCLAIMER: SONIC_METRICS IS NOT AFFILIATED WITH SPOTIFY AB.
        </span>

        <div className="flex gap-4 text-blue-400">
          <span>PRIVACY_TERMINAL</span>
          <span>SOURCE</span>
          <span>API_ATTRIBUTION</span>
        </div>
      </footer>
    </div>
  );
}

interface VizItemProps {
  index: string;
  title: string;
  body: string;
  accent: string;
  dark?: boolean;
}

function VizItem({
  index,
  title,
  body,
  accent,
  dark,
}: VizItemProps) {
  return (
    <div
      className={`viz-item opacity-0 flex items-stretch gap-4 border-2 border-black shadow-[4px_4px_0_0_#000] p-5 hover:-translate-y-1 transition-transform duration-200 ${
        dark ? "bg-black text-white" : "bg-[#faf9f4]"
      }`}
    >
      <div className={`w-1.5 border-2 border-black ${accent}`} />

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-[10px] tracking-widest ${
              dark ? "text-neutral-500" : "text-neutral-400"
            }`}
          >
            {index}
          </span>
        </div>

        <h3 className="text-lg font-black tracking-tight">
          {title}
        </h3>

        <p
          className={`mt-1 text-xs leading-relaxed ${
            dark ? "text-neutral-400" : "text-neutral-600"
          }`}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  body: string;
  accent: string;
}

function StepCard({
  number,
  title,
  body,
  accent,
}: StepCardProps) {
  return (
    <div className="step-card opacity-0 bg-[#faf9f4] border-2 border-black shadow-[6px_6px_0_0_#000] p-8 hover:-translate-y-1 transition-transform duration-200">
      <div
        className={`step-number opacity-0 inline-block border-2 border-black ${accent} text-3xl font-black px-4 py-2 mb-6 -rotate-2`}
      >
        {number}
      </div>

      <h3 className="text-2xl font-black tracking-tight mb-3">
        {title}
      </h3>

      <p className="text-xs text-neutral-600 leading-relaxed">
        {body}
      </p>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({
  label,
  value,
}: StatBoxProps) {
  return (
    <div className="border-2 border-black px-3 py-2 bg-[#faf9f4]">
      <div className="text-[10px] tracking-widest text-neutral-400">
        {label}
      </div>

      <div className="text-sm font-bold">
        {value}
      </div>
    </div>
  );
}

function AudioWaveIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 10v4" />
      <path d="M8 6v12" />
      <path d="M12 3v18" />
      <path d="M16 6v12" />
      <path d="M20 10v4" />
    </svg>
  );
}