export const genderOptions = ["MALE", "FEMALE"] as const;

export type Gender = (typeof genderOptions)[number];

export const genderLabels: Record<Gender, string> = {
  MALE: "Male",
  FEMALE: "Female",
};
