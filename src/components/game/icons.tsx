import { useId, type SVGProps } from "react";

export function SuperCrown(props: SVGProps<SVGSVGElement>) {
  const uid = useId();
  const gold = `${uid}-gold`;
  const shine = `${uid}-shine`;
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={gold} x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE9A0" />
          <stop offset="0.45" stopColor="#F5C542" />
          <stop offset="1" stopColor="#D48912" />
        </linearGradient>
        <linearGradient id={shine} x1="16" y1="12" x2="28" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M8 46.5c0-2 1.4-3.5 3.4-3.5h41.2c2 0 3.4 1.5 3.4 3.5v4.2c0 2.6-2.2 4.8-4.8 4.8H12.8C10.2 55.5 8 53.3 8 50.7v-4.2Z"
        fill={`url(#${gold})`}
        stroke="#B47400"
        strokeWidth="1.6"
      />
      <path
        d="M10.5 28.5 21 38l11-22 11 22 10.5-9.5V43H10.5V28.5Z"
        fill={`url(#${gold})`}
        stroke="#B47400"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 32.5 21 38l4-8.5-11 3Z" fill={`url(#${shine})`} />
      <circle cx="21" cy="38" r="3.2" fill="#FF4B7A" stroke="#fff" strokeWidth="1.2" />
      <circle cx="32" cy="16.5" r="4.1" fill="#2EA3FF" stroke="#fff" strokeWidth="1.3" />
      <circle cx="43" cy="38" r="3.2" fill="#2EC4B6" stroke="#fff" strokeWidth="1.2" />
      <circle cx="32" cy="36.2" r="2.6" fill="#FF5A8A" stroke="#fff" strokeWidth="1.1" />
      <circle cx="32" cy="16.2" r="1.3" fill="#fff" />
    </svg>
  );
}

export function GameLogo({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="/cover.png?v=5"
      alt=""
      width={1430}
      height={875}
      draggable={false}
    />
  );
}
