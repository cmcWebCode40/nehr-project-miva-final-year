/**
 * The catalog of record types this portal knows how to request consent
 * for and issue - a fixed, human-readable string (e.g. "Malaria Test
 * Result") doubles as the backend's free-text `resourceType`/consent
 * `scope` entry, so a consent request and a credential issuance can only
 * ever line up if they're both built from this same list. Chosen to
 * cover common everyday-Nigerian-hospital scenarios rather than raw FHIR
 * resource names, which is what "issue a VC" should read like to a
 * hospital staff member, not what it should read like to a FHIR server.
 */
export interface VcTypeFieldOption {
  value: string;
  label: string;
}

export interface VcTypeField {
  name: string;
  label: string;
  kind: "text" | "number" | "select" | "date" | "textarea";
  options?: VcTypeFieldOption[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
}

export interface VcType {
  value: string;
  label: string;
  description: string;
  fields: VcTypeField[];
}

export const VC_TYPES: VcType[] = [
  {
    value: "Malaria Test Result",
    label: "Malaria Test Result",
    description: "RDT, microscopy, or other malaria parasite test outcome.",
    fields: [
      {
        name: "testMethod",
        label: "Test method",
        kind: "select",
        required: true,
        options: [
          { value: "Rapid Diagnostic Test (RDT)", label: "Rapid Diagnostic Test (RDT)" },
          { value: "Microscopy", label: "Microscopy" },
        ],
      },
      {
        name: "result",
        label: "Result",
        kind: "select",
        required: true,
        options: [
          { value: "Positive", label: "Positive" },
          { value: "Negative", label: "Negative" },
        ],
      },
      {
        name: "parasiteDensity",
        label: "Parasite density (optional)",
        kind: "text",
        placeholder: "e.g. 2,400 parasites/µL",
      },
      { name: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  {
    value: "Typhoid Test Result",
    label: "Typhoid Test Result",
    description: "Widal test, blood culture, or Typhidot outcome.",
    fields: [
      {
        name: "testMethod",
        label: "Test method",
        kind: "select",
        required: true,
        options: [
          { value: "Widal Test", label: "Widal Test" },
          { value: "Blood Culture", label: "Blood Culture" },
          { value: "Typhidot", label: "Typhidot" },
        ],
      },
      {
        name: "result",
        label: "Result",
        kind: "select",
        required: true,
        options: [
          { value: "Positive", label: "Positive" },
          { value: "Negative", label: "Negative" },
        ],
      },
      { name: "titre", label: "Titre (optional)", kind: "text", placeholder: "e.g. O:1/160, H:1/320" },
      { name: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  {
    value: "Hypertension Diagnosis",
    label: "Hypertension Diagnosis",
    description: "Blood pressure reading and clinical staging.",
    fields: [
      { name: "systolic", label: "Systolic (mmHg)", kind: "number", required: true },
      { name: "diastolic", label: "Diastolic (mmHg)", kind: "number", required: true },
      {
        name: "stage",
        label: "Stage",
        kind: "select",
        required: true,
        options: [
          { value: "Elevated", label: "Elevated" },
          { value: "Stage 1", label: "Stage 1" },
          { value: "Stage 2", label: "Stage 2" },
          { value: "Hypertensive Crisis", label: "Hypertensive Crisis" },
        ],
      },
      { name: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  {
    value: "Diabetes Diagnosis",
    label: "Diabetes Diagnosis",
    description: "Blood sugar test result and diagnosis.",
    fields: [
      {
        name: "testType",
        label: "Test type",
        kind: "select",
        required: true,
        options: [
          { value: "Fasting Blood Sugar", label: "Fasting Blood Sugar" },
          { value: "Random Blood Sugar", label: "Random Blood Sugar" },
          { value: "HbA1c", label: "HbA1c" },
        ],
      },
      { name: "value", label: "Value", kind: "text", required: true, placeholder: "e.g. 126 mg/dL or 7.2%" },
      {
        name: "diagnosis",
        label: "Diagnosis",
        kind: "select",
        required: true,
        options: [
          { value: "Prediabetes", label: "Prediabetes" },
          { value: "Type 1 Diabetes", label: "Type 1 Diabetes" },
          { value: "Type 2 Diabetes", label: "Type 2 Diabetes" },
          { value: "Gestational Diabetes", label: "Gestational Diabetes" },
        ],
      },
      { name: "notes", label: "Notes", kind: "textarea" },
    ],
  },
  {
    value: "Vaccination Record",
    label: "Vaccination Record",
    description: "A single administered vaccine dose.",
    fields: [
      {
        name: "vaccine",
        label: "Vaccine",
        kind: "select",
        required: true,
        options: [
          { value: "Yellow Fever", label: "Yellow Fever" },
          { value: "Hepatitis B", label: "Hepatitis B" },
          { value: "COVID-19", label: "COVID-19" },
          { value: "Tetanus", label: "Tetanus" },
          { value: "Meningitis", label: "Meningitis" },
        ],
      },
      { name: "doseNumber", label: "Dose number", kind: "number", required: true },
      { name: "dateAdministered", label: "Date administered", kind: "date", required: true },
      { name: "batchNumber", label: "Batch number (optional)", kind: "text" },
      { name: "notes", label: "Notes", kind: "textarea" },
    ],
  },
];

export function findVcType(value: string): VcType | undefined {
  return VC_TYPES.find((type) => type.value === value);
}
