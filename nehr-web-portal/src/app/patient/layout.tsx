"use client";

import { PatientKeyProvider } from "./lib/PatientKeyContext";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <PatientKeyProvider>{children}</PatientKeyProvider>;
}
