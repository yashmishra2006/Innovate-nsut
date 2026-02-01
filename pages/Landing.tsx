import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Globe } from "../components/ui/globe";

const Landing: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark text-text-main font-display">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="flex flex-col justify-center text-left">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-6">
                  <span className="material-symbols-outlined text-[16px]">
                    wb_sunny
                  </span>
                  <span>Future-Ready Urban Planning</span>
                </div>
                <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl mb-6">
                  Design the Cities of{" "}
                  <span className="text-primary">Tomorrow</span>, Today
                </h1>
                <p className="text-lg text-text-muted mb-8 max-w-xl leading-relaxed">
                  Visualize the future of urban living. Plan, design, and
                  measure sustainability improvements in real-time with our
                  Solarpunk-inspired toolkit.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/map"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-bold text-[#0d1b10] shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <span>Explore the Map</span>
                    <span className="material-symbols-outlined">map</span>
                  </Link>
                  <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#cfe7d3] dark:border-[#2a4d31] bg-white/50 dark:bg-surface-dark/50 px-8 text-base font-bold text-text-main dark:text-text-main backdrop-blur-sm hover:bg-white/80 dark:hover:bg-surface-dark/80 transition-all duration-200">
                    <span className="material-symbols-outlined">
                      play_circle
                    </span>
                    <span>Watch Demo</span>
                  </button>
                </div>
                <div className="mt-10 flex items-center gap-4 text-sm text-text-muted">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="size-8 rounded-full border-2 border-background-light dark:border-surface-dark bg-gray-200 dark:bg-gray-700 bg-cover bg-center"
                        style={{
                          backgroundImage: `url('https://picsum.photos/32/32?random=${i}')`,
                        }}
                      />
                    ))}
                  </div>
                  <p>
                    Used by{" "}
                    <span className="font-bold text-text-main">2,000+</span>{" "}
                    urban planners
                  </p>
                </div>
              </div>

              {/* Hero Image / Composition */}
              <div className="relative lg:h-auto">
                <div className="absolute -top-10 -right-10 size-64 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 size-64 rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-3xl pointer-events-none"></div>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 group">
                  <Globe />
                  {/* <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFXXaLvynFtAcb_csL9JOj1zrRBRj50XA4fN3Jg0wZKckh6aWYabDFg_pZUocA4BM2NVF9pOmC1QKAUx_5GWAn-I6aqrpqkJIaRcdn57nNWgleL2TqiBZjQc2kX6upoYbkoYS8WupX5-tSebZwNIMU9LlU_5DzAFwZvx_ooUdAiGdpLbCqKu2Is50hmyw-p_SAC9ZfnBqGU-2_GTmhe7ZTWvuRXFIu2alXFORUh3c611ubzZJccnhwyGjFdcYEpcOIOnwyMryGtA')",
                    }}
                  /> */}
                  {/* Floating Card */}
                  {/* <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md p-4 border border-white/20 dark:border-white/10 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                          Live Simulation
                        </span>
                      </div>
                      <span className="text-xs font-medium text-text-main">
                        Neo-Kyoto District
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-text-muted">Air Quality</p>
                        <p className="text-lg font-bold text-primary">98 AQI</p>
                      </div>
                      <div className="flex-1 border-l border-gray-200 dark:border-gray-700 pl-4">
                        <p className="text-xs text-text-muted">Green Cover</p>
                        <p className="text-lg font-bold text-primary">+24%</p>
                      </div>
                      <div className="flex-1 border-l border-gray-200 dark:border-gray-700 pl-4">
                        <p className="text-xs text-text-muted">Energy</p>
                        <p className="text-lg font-bold text-primary">
                          Net Zero
                        </p>
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </section>
 
        {/* Key Metrics */}
        <section className="py-12 bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="rounded-lg bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] p-6 border border-[var(--color-border-light)]">
                <div className="text-2xl font-extrabold text-primary">2,000+</div>
                <div className="text-sm text-text-muted mt-1">Urban planners</div>
              </div>
              <div className="rounded-lg bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] p-6 border border-[var(--color-border-light)]">
                <div className="text-2xl font-extrabold text-primary">150K</div>
                <div className="text-sm text-text-muted mt-1">Buildings modeled</div>
              </div>
              <div className="rounded-lg bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] p-6 border border-[var(--color-border-light)]">
                <div className="text-2xl font-extrabold text-primary">24%</div>
                <div className="text-sm text-text-muted mt-1">Avg. green cover gain</div>
              </div>
              <div className="rounded-lg bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] p-6 border border-[var(--color-border-light)]">
                <div className="text-2xl font-extrabold text-primary">98 AQI</div>
                <div className="text-sm text-text-muted mt-1">Sample project air quality</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials / Case Studies */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4 sm:text-4xl text-text-main">What planners are saying</h2>
              <p className="text-lg text-text-muted">Real-world results from districts using TerraVision.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="p-6 rounded-xl bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border-light)]">
                <p className="text-text-muted text-sm">"TerraVision helped us visualize a 30% increase in green cover across the pilot corridor — stakeholders could finally see the impact."</p>
                <div className="mt-4 font-semibold text-text-main">— Dr. Meera Kapoor, Urban Design Lead</div>
              </div>
              <div className="p-6 rounded-xl bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border-light)]">
                <p className="text-text-muted text-sm">"AI renders made community consultations productive and fast. We shortened approval cycles by months."</p>
                <div className="mt-4 font-semibold text-text-main">— Ajay Singh, Municipal Planner</div>
              </div>
              <div className="p-6 rounded-xl bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border-light)]">
                <p className="text-text-muted text-sm">"The impact dashboard gave us confidence to scale the program city-wide."</p>
                <div className="mt-4 font-semibold text-text-main">— Lina Rodriguez, Sustainability Director</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-primary/5 dark:bg-primary/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface-light)] dark:bg-[var(--color-surface-dark)] border border-[var(--color-border-light)]">
              <div>
                <h3 className="text-xl font-bold text-text-main">Ready to plan sustainably at scale?</h3>
                <p className="text-text-muted">Start a project, invite collaborators, and measure real impact.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/map" className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">Get Started</Link>
                <Link to="/signup" className="rounded-xl border border-[var(--color-border-light)] px-6 py-3 font-semibold">Request Demo</Link>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="py-16 sm:py-24 bg-white dark:bg-surface-dark">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4 sm:text-4xl text-text-main">
                Powerful Planning Tools
              </h2>
              <p className="text-lg text-text-muted">
                Everything you need to visualize, analyze, and implement
                sustainable urban solutions.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Link
                to="/map"
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e7f3e9] dark:border-[#2a4d31] bg-background-light dark:bg-background-dark p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="mb-6 inline-flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-[#0d1b10] transition-colors">
                  <span className="material-symbols-outlined text-3xl">
                    map
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">
                  Interactive Map
                </h3>
                <p className="text-base leading-relaxed text-text-muted">
                  Navigate real-world terrain with overlaid sustainability
                  zones. Import GIS data and visualize zoning changes instantly.
                </p>
                <div className="mt-auto pt-6 flex items-center gap-1 text-sm font-bold text-primary group-hover:underline">
                  Start Mapping{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </Link>
              {/* Feature 2 */}
              <Link
                to="/transform"
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e7f3e9] dark:border-[#2a4d31] bg-background-light dark:bg-background-dark p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="mb-6 inline-flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-[#0d1b10] transition-colors">
                  <span className="material-symbols-outlined text-3xl">
                    auto_fix_high
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">
                  AI-Powered Before/After
                </h3>
                <p className="text-base leading-relaxed text-text-muted">
                  Generate photorealistic renders of green infrastructure
                  instantly. See how a parking lot transforms into a park.
                </p>
                <div className="mt-auto pt-6 flex items-center gap-1 text-sm font-bold text-primary group-hover:underline">
                  Try AI Render{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </Link>
              {/* Feature 3 */}
              <Link
                to="/dashboard"
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e7f3e9] dark:border-[#2a4d31] bg-background-light dark:bg-background-dark p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="mb-6 inline-flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-[#0d1b10] transition-colors">
                  <span className="material-symbols-outlined text-3xl">
                    monitoring
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-main">
                  Impact Dashboard
                </h3>
                <p className="text-base leading-relaxed text-text-muted">
                  Track carbon reduction, air quality improvements, and energy
                  savings with real-time analytics.
                </p>
                <div className="mt-auto pt-6 flex items-center gap-1 text-sm font-bold text-primary group-hover:underline">
                  View Analytics{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-background-light dark:bg-surface-dark border-t border-[#e7f3e9] dark:border-[#2a4d31] py-10">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-text-muted">
          © 2024 Sustainable City Planner. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
