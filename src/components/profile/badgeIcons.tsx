import type { LucideIcon } from 'lucide-react';
import { Bolt, Crown, Flame, Lock, ShieldCheck, Sparkles, Trophy, Award } from 'lucide-react';

const badgeIconMap: Record<string, LucideIcon> = {
  flame: Flame,
  bolt: Bolt,
  sparkles: Sparkles,
  trophy: Trophy,
  crown: Crown,
  award: Award,
  lock: Lock,
};

export function resolveBadgeIcon(iconName?: string): LucideIcon {
  if (!iconName) {
    return ShieldCheck;
  }

  const key = iconName.trim().toLowerCase();
  return badgeIconMap[key] ?? ShieldCheck;
}
