import type { ProgrammeAward } from "../schemas/programmeSchema";

export const programmeAwardLabels: Record<ProgrammeAward, string> = {
  BSC: "B.Sc",
  BA: "B.A",
  BED: "B.Ed",
  LLB: "LL.B",
  MBBS: "MBBS",
  BDS: "BDS",
  PharmD: "Pharm.D",
  BNSC: "B.NSc",
  BMLS: "B.MLS",
  MSC: "M.Sc",
  MA: "M.A",
  MBA: "MBA",
  PHD: "Ph.D",
  PGD: "PGD",
};

export function formatProgrammeAward(award: ProgrammeAward) {
  return programmeAwardLabels[award];
}

export function formatProgrammeName(name: string, award: ProgrammeAward) {
  return `${formatProgrammeAward(award)} ${name}`;
}
