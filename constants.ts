// All contribution times are in days
const Y = 365.25;

export const MIN_CONTRIBUTION = {
    male: 35 * Y,
    female: 30 * Y,
    teacher_male: 30 * Y,
    teacher_female: 25 * Y,
};

export const PERMANENT_RULE_MIN_CONTRIBUTION = 25 * Y;

// All ages are in years
export const MIN_AGE_TOLL = {
    male: 60,
    female: 55,
    teacher_male: 55,
    teacher_female: 50,
};

export const MIN_AGE_POINTS = {
    // a partir de 01/01/2022
    male: 62,
    female: 56,
    teacher_male: 57,
    teacher_female: 51,
};

export const MIN_AGE_PERMANENT = {
    male: 65,
    female: 62,
    teacher_male: 60,
    teacher_female: 57,
};

export const MIN_AGE_COMPULSORY = 75;

// Rules for servants with disabilities (LC 142/2013)
export const MIN_CONTRIBUTIONS_DISABLED_RULE = 15 * Y; // 180 contributions = 15 years
export const MIN_AGE_DISABLED = {
    male: 60,
    female: 55,
};
export const MIN_CONTRIBUTION_DISABLED = {
  grave: { male: 25 * Y, female: 20 * Y },
  moderada: { male: 29 * Y, female: 24 * Y },
  leve: { male: 33 * Y, female: 28 * Y },
};


export const MIN_PUBLIC_SERVICE_DAYS = 10 * Y;
export const MIN_ROLE_SERVICE_DAYS = 5 * Y;

export const REFORM_DATE_2020 = new Date('2020-09-15T00:00:00-03:00');
export const EC41_DATE = new Date('2003-12-31T00:00:00-03:00');
export const EC20_DATE = new Date('1998-12-16T00:00:00-03:00');

interface PointsByYear {
  [year: number]: number;
}

export const POINTS_TABLE: { [key: string]: PointsByYear } = {
  male: {
    2022: 98, 2023: 99, 2024: 100, 2025: 100, 2026: 101, 2027: 102, 2028: 103, 2029: 104, 2030: 104, 2031: 105
  },
  female: {
    2022: 87, 2023: 88, 2024: 89, 2025: 89, 2026: 90, 2027: 91, 2028: 92, 2029: 93, 2030: 93, 2031: 94, 2032: 95, 2033: 96, 2034: 97, 2035: 97, 2036: 98, 2037: 99, 2038: 100
  },
  teacher_male: {
    2022: 93, 2023: 94, 2024: 95, 2025: 96, 2026: 97, 2027: 98, 2028: 99, 2029: 100
  },
  teacher_female: {
    2022: 82, 2023: 83, 2024: 84, 2025: 85, 2026: 86, 2027: 87, 2028: 88, 2029: 89, 2030: 90, 2031: 91, 2032: 92
  }
};