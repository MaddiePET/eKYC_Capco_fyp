import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-white/10 px-4 py-5 text-center`}
    >
      <h3 className="mb-2 font-semibold text-white">
        DTCOB 
      </h3>
      <p className="mb-4 text-white/70 text-theme-sm">
        Digital Transformation of Customer Onboarding for Bank A
      </p>
      <a
        href="https://tailadmin.com/pricing"
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-white/20 text-theme-sm hover:bg-white/30"
      >
        Upgrade To Pro
      </a>
    </div>
  );
}