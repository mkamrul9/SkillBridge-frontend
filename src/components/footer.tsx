import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <h3 className="text-xl font-bold tracking-tight">SkillBridge</h3>
          <p className="text-sm text-slate-300">
            Connect with verified tutors, schedule confidently, and grow with
            personalized learning.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://github.com/mkamrul9"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cyan-300"
            >
              GitHub
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cyan-300"
            >
              X
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cyan-300"
            >
              LinkedIn
            </a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Important Links</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              <Link href="/" className="transition-colors hover:text-cyan-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/tutors" className="transition-colors hover:text-cyan-300">
                Explore Tutors
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-cyan-300">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-cyan-300">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/help" className="transition-colors hover:text-cyan-300">
                Help Center
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition-colors hover:text-cyan-300">
                Login
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-cyan-300">
                Register
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-cyan-300">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-cyan-300">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              Email: <a href="mailto:support@skillbridge.com" className="transition-colors hover:text-cyan-300">support@skillbridge.com</a>
            </li>
            <li>
              Phone: <a href="tel:+8801700000000" className="transition-colors hover:text-cyan-300">+880 1700-000000</a>
            </li>
            <li>Address: Dhaka, Bangladesh</li>
            <li>Support Hours: Sat-Thu, 9:00 AM - 6:00 PM</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
        &copy; {new Date().getFullYear()} SkillBridge. All rights reserved.
      </div>
    </footer>
  );
}
