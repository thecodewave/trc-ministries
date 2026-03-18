// ============================================================
// TRC Ministries — Absence Streak Calculator
// services/absenceStreakService.js
//
// Given all services and all attendance records, compute how
// many consecutive services each active member has missed.
// Returns members with streak >= minStreak, sorted worst first.
// ============================================================

export function computeAbsenceStreaks(members, services, attendanceMap, minStreak = 2) {
  // attendanceMap: { serviceId -> Set<memberId> }
  // services: sorted desc by date (most recent first)

  const activeMembers = members.filter((m) => m.isActive !== false)

  // Only look at ended services for streaks (live service doesn't count yet)
  const endedServices = services.filter((s) => s.ended)

  if (endedServices.length === 0) return []

  const streaks = []

  for (const member of activeMembers) {
    let streak = 0
    for (const svc of endedServices) {
      const attended = attendanceMap[svc.id]?.has(member.id)
      if (attended) break   // streak broken — they attended this one
      streak++
    }
    if (streak >= minStreak) {
      streaks.push({ member, streak })
    }
  }

  return streaks.sort((a, b) => b.streak - a.streak)
}
