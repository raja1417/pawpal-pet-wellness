export type Tip = { kind: 'weight' | 'activity' | 'vaccination' | 'general'; severity: 'info' | 'attention'; message: string };
export type TipInput = {
  wellness: Array<{ weight: number | null; activityMinutes: number | null; recordedAt: Date }>;
  vaccinations: Array<{ name: string; dueDate: Date; completedAt: Date | null }>;
  now?: Date;
};

export function generateWellnessTips({ wellness, vaccinations, now = new Date() }: TipInput): Tip[] {
  const tips: Tip[] = [];
  const weights = wellness.filter((item) => item.weight != null).sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());
  if (weights.length >= 2) {
    const first = weights[0].weight as number;
    const last = weights[weights.length - 1].weight as number;
    if (first > 0 && (last - first) / first >= 0.05) {
      tips.push({ kind: 'weight', severity: 'attention', message: 'Weight has increased by at least 5%. Consider discussing diet and activity with your vet.' });
    }
  }
  const recentCutoff = now.getTime() - 14 * 86400000;
  const recentActivity = wellness.filter((item) => item.recordedAt.getTime() >= recentCutoff && item.activityMinutes != null);
  if (recentActivity.length) {
    const average = recentActivity.reduce((sum, item) => sum + (item.activityMinutes ?? 0), 0) / recentActivity.length;
    if (average < 30) tips.push({ kind: 'activity', severity: 'attention', message: 'Recent activity averages under 30 minutes. Add gentle play or walks when appropriate.' });
  }
  const overdue = vaccinations.filter((item) => !item.completedAt && item.dueDate < now);
  if (overdue.length) {
    tips.push({ kind: 'vaccination', severity: 'attention', message: `${overdue.length} vaccination${overdue.length === 1 ? ' is' : 's are'} overdue. Contact your clinic to reschedule.` });
  }
  if (!tips.length) tips.push({ kind: 'general', severity: 'info', message: 'Records look on track. Keep logging regularly to spot changes early.' });
  return tips;
}
