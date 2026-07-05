import Svg, { Path, Circle, Rect } from "react-native-svg";

interface IconProps { color: string; size?: number; }

export function HomeIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <Path d="M9 22V12h6v10" />
    </Svg>
  );
}

export function DumbbellIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6.5 6.5h11M6.5 17.5h11" />
      <Rect x="2" y="4.5" width="4.5" height="15" rx="1.5" />
      <Rect x="17.5" y="4.5" width="4.5" height="15" rx="1.5" />
      <Path d="M12 6.5v11" />
    </Svg>
  );
}

export function AppleIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <Path d="M9 9h.01M15 9h.01" />
    </Svg>
  );
}

export function ForkKnifeIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <Path d="M7 2v20" />
      <Path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </Svg>
  );
}

export function TrendingUpIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 6l-9.5 9.5-5-5L1 18" />
      <Path d="M17 6h6v6" />
    </Svg>
  );
}

export function ChatIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
    </Svg>
  );
}

export function TrophyIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
      <Path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
      <Path d="M4 22h16" />
      <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
      <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
      <Path d="M18 2H6v7a6 6 0 1012 0V2z" />
    </Svg>
  );
}
