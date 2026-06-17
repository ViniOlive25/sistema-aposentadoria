export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum Role {
  Administrative = 'administrative',
  Teacher = 'teacher',
}

export enum DisabilityDegree {
  None = 'none',
  Grave = 'grave',
  Moderada = 'moderada',
  Leve = 'leve',
}

export interface UserData {
  name: string;
  masp: string;
  admissionNumber?: string;
  gender: Gender;
  role: Role;
  birthDate: string;
  entryDate: string;
  entryDatePre1998: boolean;
  contributionDays_2020: number;
  contributionDays_today: number;
  hasAveragedTime: boolean;
  averagedTimeInDays?: number;
  disabilityDegree: DisabilityDegree;
  hasFeriasPremio?: boolean;
  feriasPremioDays?: number;
}

export interface RequirementStatus {
  label: string;
  required: string;
  current: string;
  met: boolean;
  missing?: string;
  currentValue?: number;
  requiredValue?: number;
}

export interface RuleResult {
  ruleName: string;
  eligible: boolean;
  eligibilityDate?: string;
  remuneration: string;
  requirements: RequirementStatus[];
  description: string;
  overallProgress?: number;
  projectedEligibilityDate?: string;
  projectedEligibilityDateObj?: Date;
}

export interface AnalysisResult {
  userName?: string;
  userMasp?: string;
  userAdmissionNumber?: string;
  calculatedOn: string;
  rules: RuleResult[];
  feriasPremioIncluded?: number;
  eligibleForAbono?: boolean;
}