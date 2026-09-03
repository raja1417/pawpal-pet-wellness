import { generateWellnessTips } from '../src/tips';

const now = new Date('2026-09-03T12:00:00Z');

describe('generateWellnessTips', () => {
  it('flags rising weight, low activity, and overdue vaccinations', () => {
    const tips = generateWellnessTips({
      now,
      wellness: [
        { weight: 10, activityMinutes: 15, recordedAt: new Date('2026-08-25') },
        { weight: 10.6, activityMinutes: 20, recordedAt: new Date('2026-09-02') }
      ],
      vaccinations: [{ name: 'Rabies', dueDate: new Date('2026-09-01'), completedAt: null }]
    });
    expect(tips.map((tip) => tip.kind)).toEqual(['weight', 'activity', 'vaccination']);
  });

  it('returns reassurance when no rule fires', () => {
    expect(generateWellnessTips({
      now,
      wellness: [{ weight: 10, activityMinutes: 60, recordedAt: new Date('2026-09-02') }],
      vaccinations: []
    })).toEqual([expect.objectContaining({ kind: 'general', severity: 'info' })]);
  });

  it('ignores completed vaccinations', () => {
    const tips = generateWellnessTips({
      now,
      wellness: [],
      vaccinations: [{ name: 'Rabies', dueDate: new Date('2026-01-01'), completedAt: new Date('2026-01-01') }]
    });
    expect(tips).not.toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'vaccination' })]));
  });
});
