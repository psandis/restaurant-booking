export enum BookingStep {
  DETAILS = "DETAILS",
  TIME_SELECTION = "TIME_SELECTION",
  CONFIRMATION = "CONFIRMATION",
  CONFIRMED = "CONFIRMED",
}

export interface BookingDetails {
  guests: number;
  date: string;
  time: string;
  experience: string;
}

export interface UserDetails {
  name: string;
  phone: string;
  specialRequests?: string;
}
