import test from "node:test";
import assert from "node:assert/strict";
import {
  SURVEY_SOURCES,
  SURVEY_ROLES,
  SURVEY_INDUSTRIES,
  SURVEY_NEEDS,
  surveyAnswersSchema,
  surveySubmissionSchema,
  claimSchema,
} from "../../src/lib/survey.ts";

const valid = {
  source: "School",
  role: "High school student",
  industries: ["Law"],
  needs: ["Career readiness"],
  confidence: 3,
};
test("survey option lists match the five-question contract", () => {
  assert.deepEqual(SURVEY_SOURCES, [
    "School",
    "Friend",
    "LinkedIn",
    "Instagram",
    "Parent/Teacher",
    "Other",
  ]);
  assert.deepEqual(SURVEY_ROLES, [
    "High school student",
    "University student",
    "Parent",
    "Educator",
    "Industry professional",
    "Other",
  ]);
  assert.deepEqual(SURVEY_INDUSTRIES, [
    "Law",
    "Entrepreneurship",
    "Investment Banking & Trading",
    "Other Finance",
    "Tax",
    "Economics",
    "Operations",
    "Not sure yet",
  ]);
  assert.deepEqual(SURVEY_NEEDS, [
    "Understanding industries",
    "Career readiness",
    "Personal finance",
    "Independent living skills",
    "Other",
  ]);
});
test("survey accepts every listed value and integer confidence 1–5", () => {
  for (const source of SURVEY_SOURCES)
    assert.ok(surveyAnswersSchema.safeParse({ ...valid, source }).success);
  for (const role of SURVEY_ROLES)
    assert.ok(surveyAnswersSchema.safeParse({ ...valid, role }).success);
  assert.ok(
    surveyAnswersSchema.safeParse({
      ...valid,
      industries: [...SURVEY_INDUSTRIES],
      needs: [...SURVEY_NEEDS],
    }).success,
  );
  for (const confidence of [1, 2, 3, 4, 5])
    assert.ok(surveyAnswersSchema.safeParse({ ...valid, confidence }).success);
});
test("survey rejects unknown values and missing required answers", () => {
  for (const patch of [
    { source: "school" },
    { role: "Visitor" },
    { industries: ["Medicine"] },
    { needs: ["Unknown"] },
  ]) {
    assert.equal(surveyAnswersSchema.safeParse({ ...valid, ...patch }).success, false);
  }
  for (const key of Object.keys(valid)) {
    const incomplete = { ...valid };
    delete incomplete[key];
    assert.equal(surveyAnswersSchema.safeParse(incomplete).success, false, key);
  }
});
test("survey rejects empty, duplicate, oversized and non-array selections", () => {
  for (const field of ["industries", "needs"]) {
    const value = valid[field][0];
    for (const selection of [[], [value, value], Array(13).fill(value), value, null]) {
      assert.equal(
        surveyAnswersSchema.safeParse({ ...valid, [field]: selection }).success,
        false,
        field,
      );
    }
  }
});
test("survey rejects out-of-range, fractional and non-number confidence", () => {
  for (const confidence of [0, 6, -1, 2.5, "3", null, NaN, Infinity]) {
    assert.equal(
      surveyAnswersSchema.safeParse({ ...valid, confidence }).success,
      false,
      String(confidence),
    );
  }
});
test("submission accepts an optional honeypot string up to 200 characters", () => {
  for (const data of [
    { answers: valid },
    { answers: valid, website: "" },
    { answers: valid, website: "a".repeat(200) },
  ]) {
    assert.ok(surveySubmissionSchema.safeParse(data).success);
  }
  for (const website of ["a".repeat(201), 1, null])
    assert.equal(surveySubmissionSchema.safeParse({ answers: valid, website }).success, false);
  assert.equal(
    surveySubmissionSchema.safeParse({ answers: { ...valid, confidence: 6 } }).success,
    false,
  );
});
test("claim requires a UUID and exactly 43 base64url characters", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";
  const claimToken = "A".repeat(41) + "_-";
  assert.ok(claimSchema.safeParse({ id, claimToken }).success);
  for (const token of [
    "",
    "a".repeat(42),
    "a".repeat(44),
    "a".repeat(42) + "=",
    "a".repeat(42) + "+",
    "a".repeat(42) + "/",
    "a".repeat(42) + " ",
  ]) {
    assert.equal(claimSchema.safeParse({ id, claimToken: token }).success, false, token);
  }
  for (const badId of ["", "not-a-uuid", "123e4567-e89b-42d3-a456-42661417400Z"]) {
    assert.equal(claimSchema.safeParse({ id: badId, claimToken }).success, false);
  }
});
