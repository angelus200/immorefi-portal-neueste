// Questionnaire Response Status Types
export type QuestionnaireStatus = "unvollständig" | "abgeschlossen" | "ungültig";

export const QUESTIONNAIRE_STATUS = {
  INCOMPLETE: "unvollständig" as const,
  COMPLETED: "abgeschlossen" as const,
  INVALID: "ungültig" as const,
};

// Status colors for frontend display
export const QUESTIONNAIRE_STATUS_COLORS = {
  unvollständig: "yellow",
  abgeschlossen: "green",
  ungültig: "red",
} as const;

// Status labels in German
export const QUESTIONNAIRE_STATUS_LABELS = {
  unvollständig: "Unvollständig",
  abgeschlossen: "Abgeschlossen",
  ungültig: "Ungültig",
} as const;
