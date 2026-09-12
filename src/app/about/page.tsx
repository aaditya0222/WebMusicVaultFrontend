"use client";

import { useEffect, useState } from "react";
import { getSongsLength } from "@/services/song.services";
import CountUp from "react-countup";
import Navbar from "@/components/Navbar/Navbar";

const About = () => {
  const [songsLength, setSongsLength] = useState<number | null>(null);

  useEffect(() => {
    document.title = "About | WmV";

    const fetchSongsLength = async () => {
      const length = await getSongsLength();
      setSongsLength(length);
    };

    fetchSongsLength();
  }, []);

  const features = [
    {
      number: "01",
      category: "PLAYER",
      title: "Listen your way",
      description:
        "A persistent music player with mini and expanded modes, seeking, previous/next controls, and playback that stays with you while navigating the site.",
      tags: ["Mini Player", "Expanded Player", "Persistent Playback"],
    },
    {
      number: "02",
      category: "DISCOVERY",
      title: "Find something to listen to",
      description:
        "Browse the full library, search by song or artist, sort results, or let the shuffle page pick something random for you.",
      tags: ["Search", "Infinite Scroll", "Shuffle", "Sorting"],
    },
    {
      number: "03",
      category: "PLAYBACK",
      title: "Control the way music plays",
      description:
        "Choose between shuffle, repeat all, repeat one, or simply let the playlist play through without repeating.",
      tags: ["Shuffle", "Repeat All", "Repeat One", "No Repeat"],
    },
    {
      number: "04",
      category: "PERSONAL",
      title: "Keep your favorites organized",
      description:
        "Like songs you enjoy and create your own playlists with custom names, descriptions, and visibility settings.",
      tags: ["Liked Songs", "Playlists", "Public / Private"],
    },
    {
      number: "05",
      category: "SHARING",
      title: "Share a song directly",
      description:
        "Generate a shareable link for a song. Opening the link takes you directly to that track.",
      tags: ["Share Links", "Deep Linking"],
    },
    {
      number: "06",
      category: "ACCOUNT",
      title: "Your account, your space",
      description:
        "Sign in with Google or email, customize your profile, and manage your personal music experience.",
      tags: ["Google OAuth", "Email Login", "Profile"],
    },
    {
      number: "07",
      category: "ADMIN",
      title: "A library I can actually manage",
      description:
        "As the admin, I can upload, edit, delete, and pin songs while managing the entire music library.",
      tags: ["Upload", "Edit", "Delete", "Pin Songs"],
    },
    {
      number: "08",
      category: "DOWNLOAD",
      title: "Take your music with you",
      description:
        "Download songs directly from the application whenever you want to keep a copy on your device.",
      tags: ["Downloads", "Confirmation"],
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen p-4 sm:p-6 flex flex-col gap-14 font-sans text-purple-100 bg-[#5520A5]">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-xl tracking-tight">
            WmV <span className="text-purple-400">🎵</span>
          </h1>

          <div className="space-y-4 text-purple-300/80 text-base leading-relaxed max-w-2xl mx-auto px-4">
            <p>
              WebMusicVault (WmV) is my first fullstack project where you can
              listen to my songs with different player options. It&apos;s live
              and can be used by people out there or at least me and my loved
              ones.
            </p>

            <p>
              This is version 3 of this site which is going to be completed in
              some days. Anyways, it still works without full completion🙂. You
              can use this if you like my music taste :).
            </p>

            <div className="pt-2 text-purple-200/70">
              <p className="font-medium">
                I am the daily user of this thing 😅.
              </p>

              <p className="text-pink-300 font-semibold mt-1 animate-pulse">
                “Aadhi zindagi aapko manane mein, baaki aadhi aapke saath. 💗”
              </p>
            </div>
          </div>

          <div className="pt-4">
            <p className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-purple-100 px-4 py-1.5 rounded-full font-semibold text-sm border border-white/10 shadow-lg hover:bg-white/20 transition-all cursor-default">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Developed with ❤️ by Aaditya!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-7 shadow-xl">
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-purple-400/20 blur-3xl" />

            <p className="text-purple-300 text-sm uppercase tracking-[0.2em] font-semibold">
              Music Library
            </p>

            <div className="flex items-end gap-3 mt-2">
              <h2 className="text-5xl sm:text-6xl font-bold text-white">
                {songsLength !== null ? (
                  <CountUp end={songsLength} duration={2} />
                ) : (
                  <i className="ri-loader-2-line text-purple-300 inline-block text-4xl animate-spin" />
                )}
              </h2>

              <span className="text-purple-200 mb-2 text-lg">songs</span>
            </div>

            <p className="text-purple-300/70 mt-2">
              Currently available in the vault.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-7 shadow-xl">
            <p className="text-purple-300 text-sm uppercase tracking-[0.2em] font-semibold">
              Infrastructure
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-white">
                🌐 Vercel
              </span>

              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-white">
                💻 Render
              </span>

              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-white">
                ☁️ Cloudinary
              </span>

              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-white">
                🍃 MongoDB
              </span>
            </div>

            <p className="text-purple-300/70 mt-4">
              Hosted and built as a real full-stack application.
            </p>
          </div>
        </div>

        {/* Features */}
        <section className="max-w-5xl w-full mx-auto">
          <div className="mb-8">
            <p className="text-purple-300 text-sm uppercase tracking-[0.25em] font-semibold">
              The Experience
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              What you can do here
            </h2>

            <p className="text-purple-200/70 mt-2 max-w-2xl">
              WmV started as a simple music player. It has grown into a personal
              music platform with everything I actually use.
            </p>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="group py-7 sm:py-8 grid grid-cols-[48px_1fr] sm:grid-cols-[72px_130px_1fr] gap-4 sm:gap-6 transition-all"
              >
                <span className="text-purple-400/70 text-sm font-mono pt-1">
                  {feature.number}
                </span>

                <span className="hidden sm:block text-purple-300/50 text-[11px] font-semibold tracking-[0.2em] pt-1">
                  {feature.category}
                </span>

                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white group-hover:text-purple-200 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-purple-200/70 mt-2 leading-relaxed max-w-3xl">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-purple-200/70 bg-white/5 border border-white/10 rounded-full px-3 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-xl">
            <p className="text-purple-300 text-sm uppercase tracking-[0.2em] font-semibold">
              Under the hood
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-6">
              Tech Stack
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-white font-semibold">Frontend</p>
                <p className="text-purple-200/70 text-sm mt-1">
                  Next.js · TypeScript · Tailwind CSS · Redux Toolkit · GSAP ·
                  Lucide
                </p>
              </div>

              <div>
                <p className="text-white font-semibold">Backend</p>
                <p className="text-purple-200/70 text-sm mt-1">
                  Node.js · Express · TypeScript · Multer
                </p>
              </div>

              <div>
                <p className="text-white font-semibold">Data & Storage</p>
                <p className="text-purple-200/70 text-sm mt-1">
                  MongoDB · Cloudinary
                </p>
              </div>

              <div>
                <p className="text-white font-semibold">Authentication</p>
                <p className="text-purple-200/70 text-sm mt-1">
                  JWT · Google OAuth · bcrypt
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-6 sm:p-7 shadow-xl">
            <p className="text-purple-300 text-sm uppercase tracking-[0.2em] font-semibold">
              Next up
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-6">
              Coming Soon 🚀
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-purple-200">
                <span className="text-lg">⏱️</span>
                <span>Sleep timer & stop after current song</span>
              </div>

              <div className="flex items-center gap-3 text-purple-200">
                <span className="text-lg">▶️</span>
                <span>Continue listening & playback persistence</span>
              </div>

              <div className="flex items-center gap-3 text-purple-200">
                <span className="text-lg">📊</span>
                <span>Personal listening analytics & history</span>
              </div>
              <div className="flex items-center gap-3 text-purple-200">
                <span className="text-lg">🎲</span>
                <span>Personal smart discovery modes</span>
              </div>

              <div className="flex items-center gap-3 text-purple-200">
                <span className="text-lg">🎤</span>
                <span>Lyrics</span>
              </div>

              <div className="flex items-center gap-3 text-purple-200">
                <span className="text-lg">🎚️</span>
                <span>Audio visualizer & playback enhancements</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <div className="max-w-5xl w-full mx-auto text-center text-purple-200 border-t border-white/10 pt-8">
          <p>
            For any suggestions or queries, reach out at{" "}
            <a
              href="mailto:aadityabhai20@gmail.com"
              className="text-white font-semibold underline underline-offset-4 hover:text-purple-200 transition-colors"
            >
              aadityabhai20@gmail.com
            </a>
          </p>
        </div>

        {/* Version */}
        <div className="text-center text-purple-300/60 text-sm pb-2">
          <p>WMV v3.0.0 · Last updated September 2026</p>
        </div>
      </div>
    </>
  );
};

export default About;
