'use client';

import { useMemo, useRef, useState } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ClockIcon,
  SpinnerIcon,
} from "@/components/icons";
import { findAvailableTimes } from "@/services/geminiService";
import { BookingStep, type BookingDetails, type UserDetails } from "@/types/booking";

const experiences = [
  {
    name: "The Hearth",
    description:
      "The vibrant heart of our restaurant, centered around the wood-fired grill. Perfect for an energetic dining experience.",
    image: "/images/tables/hearth.jpg",
  },
  {
    name: "The Chef's Table",
    description:
      "An intimate counter seating with a direct view of the kitchen. A culinary journey for the adventurous.",
    image: "/images/tables/chefs-table.jpg",
  },
  {
    name: "The Courtyard",
    description:
      "A serene, open-air space for a relaxed meal under the stars. Perfect for groups and special occasions.",
    image: "/images/tables/courtyard.jpg",
  },
  {
    name: "The Private Cellar",
    description:
      "An exclusive setting for private gatherings, surrounded by our curated wine collection. Ideal for celebrations.",
    image: "/images/tables/private-cellar.jpg",
  },
];

export default function Home() {
  const [step, setStep] = useState<BookingStep>(BookingStep.DETAILS);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    guests: 2,
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    experience: "",
  });
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    phone: "",
    specialRequests: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (let hour = 17; hour < 23; hour += 1) {
      options.push(`${hour.toString().padStart(2, "0")}:00`);
      options.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return options;
  }, []);

  const handleDetailsChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBookingDetails((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleGuestChange = (delta: number) => {
    setBookingDetails((prev) => ({
      ...prev,
      guests: Math.max(1, Math.min(20, prev.guests + delta)),
    }));
  };

  const handleExperienceSelect = (experience: string) => {
    setBookingDetails((prev) => ({ ...prev, experience }));
  };

  const handleBackToExperience = () => {
    setBookingDetails((prev) => ({ ...prev, experience: "" }));
  };

  const handleFindTimes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const times = await findAvailableTimes(bookingDetails);
      if (times.length) {
        setAvailableTimes(times);
        setStep(BookingStep.TIME_SELECTION);
      } else {
        setError("We couldn't find any available tables at that time. Please try another window.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(BookingStep.CONFIRMATION);
  };

  const handleUserDetailsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setUserDetails((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleConfirmBooking = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(BookingStep.CONFIRMED);
    }, 1500);
  };

  const handleReset = () => {
    setStep(BookingStep.DETAILS);
    setBookingDetails({
      guests: 2,
      date: new Date().toISOString().split("T")[0],
      time: "19:00",
      experience: "",
    });
    setAvailableTimes([]);
    setSelectedTime("");
    setUserDetails({ name: "", phone: "", specialRequests: "" });
    setError(null);
  };

  const isExperienceSelection = !bookingDetails.experience && step === BookingStep.DETAILS;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white font-light">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-center opacity-15"
        style={{
          backgroundImage:
            "url(/images/tables/hero.jpg)",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

      <div
        className={`relative z-10 w-full transition-all duration-500 ${
          isExperienceSelection ? "max-w-5xl" : "max-w-lg"
        }`}
      >
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-200">An exploration of smoke and fire</p>
          <h1 className="mt-3 text-4xl font-serif font-bold text-amber-400 sm:text-5xl">
            <span className="font-light">Ember</span> &amp; Ash
          </h1>
        </header>

        <main className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-2xl sm:p-8">
          {step === BookingStep.DETAILS && !bookingDetails.experience && (
            <ExperienceSelection onSelect={handleExperienceSelect} />
          )}

          {step === BookingStep.DETAILS && bookingDetails.experience && (
            <DetailsForm
              details={bookingDetails}
              onDetailsChange={handleDetailsChange}
              onGuestChange={handleGuestChange}
              onSubmit={handleFindTimes}
              isLoading={isLoading}
              timeOptions={timeOptions}
              onBack={handleBackToExperience}
              dateInputRef={dateInputRef}
            />
          )}

          {step === BookingStep.TIME_SELECTION && (
            <TimeSelection
              times={availableTimes}
              onTimeSelect={handleTimeSelect}
              onBack={() => setStep(BookingStep.DETAILS)}
              bookingDetails={bookingDetails}
            />
          )}

          {step === BookingStep.CONFIRMATION && (
            <ConfirmationForm
              details={userDetails}
              onDetailsChange={handleUserDetailsChange}
              onSubmit={handleConfirmBooking}
              isLoading={isLoading}
              bookingSummary={{ ...bookingDetails, time: selectedTime }}
              onBack={() => setStep(BookingStep.TIME_SELECTION)}
            />
          )}

          {step === BookingStep.CONFIRMED && (
            <BookingConfirmed
              bookingSummary={{ ...bookingDetails, time: selectedTime }}
              userDetails={userDetails}
              onNewBooking={handleReset}
            />
          )}

          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
        </main>

        <footer className="mt-6 text-center text-xs uppercase tracking-[0.4em] text-slate-500">
          © {new Date().getFullYear()} Ember &amp; Ash · Smoke Kitchen Collection
        </footer>
      </div>
    </div>
  );
}

const ExperienceSelection = ({ onSelect }: { onSelect: (experience: string) => void }) => (
  <section className="animate-in fade-in duration-500">
    <h2 className="text-center text-2xl font-serif text-amber-400">Begin your experience</h2>
    <p className="mt-2 text-center text-sm text-slate-300">Choose a dining setting that suits your occasion.</p>
    <div className="mt-8 grid gap-6 sm:grid-cols-2">
      {experiences.map((exp) => (
        <article
          key={exp.name}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(exp.name)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(exp.name);
            }
          }}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 text-left transition-all duration-500 hover:-translate-y-1 hover:border-amber-300/70 hover:shadow-[0_25px_80px_rgba(248,181,98,0.4)] hover:ring-2 hover:ring-amber-200/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/50"
        >
          <div className="relative h-48 w-full overflow-hidden">
            <div
              className="h-full w-full bg-cover bg-center transition-transform duration-[900ms] group-hover:scale-110"
              style={{ backgroundImage: `url(${exp.image})` }}
              aria-hidden
            />
          </div>
          <div className="flex flex-col justify-between p-4">
            <div>
              <h3 className="font-serif text-xl text-white">{exp.name}</h3>
              <p className="mt-2 text-sm text-slate-300">{exp.description}</p>
            </div>
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-amber-200/40 px-5 py-2 text-sm font-semibold text-amber-200 transition-all duration-500 hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(exp.name);
                }}
              >
                <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 opacity-0 transition duration-500 group-hover:opacity-100" />
                <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-amber-400 to-amber-200 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
                <span className="transition-all duration-500 group-hover:text-slate-950 group-hover:tracking-[0.08em]">
                  Select
                </span>
                <svg
                  className="h-4 w-4 text-amber-200 transition-transform duration-500 group-hover:translate-x-1.5 group-hover:text-slate-950"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

type DetailsFormProps = {
  details: BookingDetails;
  onDetailsChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onGuestChange: (amount: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  timeOptions: string[];
  onBack: () => void;
  dateInputRef: React.RefObject<HTMLInputElement | null>;
};

const DetailsForm = ({
  details,
  onDetailsChange,
  onGuestChange,
  onSubmit,
  isLoading,
  timeOptions,
  onBack,
  dateInputRef,
}: DetailsFormProps) => (
  <section className="space-y-6">
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center text-sm text-amber-300 hover:text-amber-200"
      >
        <ChevronLeftIcon className="mr-1 h-4 w-4" />
        Back
      </button>
      <h2 className="text-lg font-serif text-amber-400">Reserve at {details.experience}</h2>
    </div>

    <div>
      <label className="mb-2 block text-sm text-slate-300">Number of guests</label>
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/40 p-2">
        <button
          type="button"
          onClick={() => onGuestChange(-1)}
          className="rounded-lg bg-slate-800 px-4 py-2 text-lg text-white hover:bg-slate-700"
        >
          −
        </button>
        <span className="text-lg font-semibold">{details.guests}</span>
        <button
          type="button"
          onClick={() => onGuestChange(1)}
          className="rounded-lg bg-slate-800 px-4 py-2 text-lg text-white hover:bg-slate-700"
        >
          +
        </button>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <label className="space-y-2 text-sm text-slate-300">
        Date
        <div className="relative">
          <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-amber-300" />
          <input
            ref={dateInputRef}
            type="date"
            name="date"
            value={details.date}
            min={new Date().toISOString().split("T")[0]}
            onChange={onDetailsChange}
            className="w-full rounded-xl border border-white/10 bg-slate-900/40 py-2 pl-10 pr-3 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        Time
        <div className="relative">
          <ClockIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-300" />
          <select
            name="time"
            value={details.time}
            onChange={onDetailsChange}
            className="w-full rounded-xl border border-white/10 bg-slate-900/40 py-2 pl-10 pr-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
          >
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </label>
    </div>

    <button
      type="button"
      onClick={onSubmit}
      disabled={isLoading}
      className="flex w-full items-center justify-center rounded-xl bg-amber-400 py-3 text-slate-950 font-semibold transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? <SpinnerIcon className="h-6 w-6 animate-spin" /> : "Find available tables"}
    </button>
  </section>
);

type TimeSelectionProps = {
  times: string[];
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  bookingDetails: BookingDetails;
};

const TimeSelection = ({ times, onTimeSelect, onBack, bookingDetails }: TimeSelectionProps) => (
  <section className="text-center">
    <h2 className="text-2xl font-serif text-amber-400">Select a time</h2>
    <p className="mt-2 text-sm text-slate-300">
      For {bookingDetails.guests} {bookingDetails.guests > 1 ? "guests" : "guest"} at{" "}
      {bookingDetails.experience}
    </p>
    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
      {new Date(bookingDetails.date).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </p>

    <div className="mt-6 grid grid-cols-3 gap-3">
      {times.map((time) => (
        <button
          type="button"
          key={time}
          onClick={() => onTimeSelect(time)}
          className="rounded-xl border border-white/10 bg-slate-900/40 py-3 text-sm font-semibold transition hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950"
        >
          {time}
        </button>
      ))}
    </div>

    <button
      type="button"
      onClick={onBack}
      className="mt-6 flex w-full items-center justify-center text-sm text-amber-300 hover:text-amber-200"
    >
      <ChevronLeftIcon className="mr-1 h-4 w-4" />
      Change details
    </button>
  </section>
);

type ConfirmationFormProps = {
  details: UserDetails;
  onDetailsChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
  bookingSummary: BookingDetails;
  onBack: () => void;
};

const ConfirmationForm = ({
  details,
  onDetailsChange,
  onSubmit,
  isLoading,
  bookingSummary,
  onBack,
}: ConfirmationFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <h2 className="text-center text-2xl font-serif text-amber-400">Confirm your booking</h2>
    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 text-sm text-slate-200">
      <p>
        {bookingSummary.guests} Guests · <span className="font-semibold">{bookingSummary.experience}</span>
      </p>
      <p className="text-slate-400">
        {new Date(bookingSummary.date).toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}{" "}
        at <span className="font-semibold text-amber-400">{bookingSummary.time}</span>
      </p>
    </div>

    <label className="block text-sm text-slate-300">
      Full name
      <input
        required
        name="name"
        value={details.name}
        onChange={onDetailsChange}
        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 p-2 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
      />
    </label>

    <label className="block text-sm text-slate-300">
      Phone number
      <input
        required
        name="phone"
        type="tel"
        value={details.phone}
        onChange={onDetailsChange}
        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 p-2 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
      />
    </label>

    <label className="block text-sm text-slate-300">
      Special requests (optional)
      <textarea
        name="specialRequests"
        rows={3}
        value={details.specialRequests}
        onChange={onDetailsChange}
        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/40 p-2 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-300/40"
      />
    </label>

    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onBack}
        className="w-full rounded-xl border border-white/20 bg-slate-800 py-3 font-semibold text-white transition hover:bg-slate-700"
      >
        Back
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-amber-400 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? <SpinnerIcon className="mx-auto h-5 w-5 animate-spin" /> : "Confirm booking"}
      </button>
    </div>
  </form>
);

type BookingConfirmedProps = {
  bookingSummary: BookingDetails;
  userDetails: UserDetails;
  onNewBooking: () => void;
};

const BookingConfirmed = ({ bookingSummary, userDetails, onNewBooking }: BookingConfirmedProps) => (
  <section className="text-center">
    <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-400" />
    <h2 className="mt-4 text-2xl font-serif text-emerald-300">Booking confirmed</h2>
    <p className="mt-2 text-slate-300">Thank you, {userDetails.name || "guest"}. We look forward to hosting you.</p>
    <div className="mt-6 space-y-2 rounded-xl border border-white/10 bg-slate-900/40 p-4 text-left text-sm text-slate-200">
      <p>
        <span className="text-slate-400">Experience:</span> {bookingSummary.experience}
      </p>
      <p>
        <span className="text-slate-400">Guests:</span> {bookingSummary.guests}
      </p>
      <p>
        <span className="text-slate-400">Date:</span>{" "}
        {new Date(bookingSummary.date).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p>
        <span className="text-slate-400">Time:</span>{" "}
        <span className="font-semibold text-amber-400">{bookingSummary.time}</span>
      </p>
    </div>

    <button
      type="button"
      onClick={onNewBooking}
      className="mt-6 w-full rounded-xl bg-amber-400 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
    >
      Make another booking
    </button>
  </section>
);
