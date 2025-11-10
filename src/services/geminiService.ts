import type { BookingDetails } from "@/types/booking";

const baseSlots = [
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

/**
 * Placeholder for an AI-powered availability lookup.
 * For now we synthesize options so the UI feels responsive offline.
 */
export async function findAvailableTimes(details: BookingDetails): Promise<string[]> {
  // Simulate network
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simple heuristic: later parties get later slots.
  const guestWeight = Math.min(details.guests, 8);
  const startIndex = guestWeight <= 2 ? 0 : guestWeight <= 4 ? 2 : 4;

  const slots = baseSlots.slice(startIndex, startIndex + 6);

  // Nudge toward requested time if it exists.
  if (!slots.includes(details.time) && baseSlots.includes(details.time)) {
    slots.splice(1, 0, details.time);
  }

  // Deduplicate and ensure chronological order.
  return Array.from(new Set(slots)).sort();
}
