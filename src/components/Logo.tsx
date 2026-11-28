export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Journal 999" className="shrink-0">
      <defs>
        <linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#26315f" />
          <stop offset="1" stopColor="#0d1228" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#lg-bg)" />
      <circle cx="30" cy="27" r="11" fill="none" stroke="#fff" strokeWidth="6" />
      <path d="M41 27c0 13-5 21-17 23" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <circle cx="48" cy="15" r="5.5" fill="#ff5a42" />
    </svg>
  );
}

export function Wordmark({ brand }: { brand: string }) {
  const m = brand.match(/^(.*?)(\s*999)$/);
  return (
    <span className="font-serif text-[1.35rem] font-semibold leading-none tracking-tight">
      {m ? m[1] : brand}
      {m && <span className="text-accent"> 999</span>}
    </span>
  );
}
