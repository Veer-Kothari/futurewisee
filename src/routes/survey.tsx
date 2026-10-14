import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { LogInForm, SignUpForm } from "@/components/auth/auth-forms";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/lib/auth";
import { savePendingClaim } from "@/lib/pending-claim";
import { pageTitle, seo } from "@/lib/seo";
import {
  SURVEY_INDUSTRIES,
  SURVEY_NEEDS,
  SURVEY_ROLES,
  SURVEY_SOURCES,
  surveyAnswersSchema,
  type SurveyAnswers,
} from "@/lib/survey";
import { submitSurvey, type SubmitSurveyResult } from "@/lib/survey.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/survey")({
  head: () =>
    seo(
      "/survey",
      pageTitle("Take the Survey"),
      "Share your perspective and help FutureWise create resources that work for students in Oman.",
    ),
  component: SurveyPage,
});

type Draft = {
  source: string | undefined;
  role: string | undefined;
  industries: string[];
  needs: string[];
  confidence: number | undefined;
};

type Question =
  | { key: "source" | "role"; type: "single"; question: string; options: readonly string[] }
  | { key: "industries" | "needs"; type: "multi"; question: string; options: readonly string[] }
  | { key: "confidence"; type: "scale"; question: string; labels: [string, string] };

const questions: Question[] = [
  {
    key: "source",
    type: "single",
    question: "How did you hear about FutureWise?",
    options: SURVEY_SOURCES,
  },
  { key: "role", type: "single", question: "Which best describes you?", options: SURVEY_ROLES },
  {
    key: "industries",
    type: "multi",
    question: "Which industries are you most interested in?",
    options: SURVEY_INDUSTRIES,
  },
  {
    key: "needs",
    type: "multi",
    question: "What do you need the most help with right now?",
    options: SURVEY_NEEDS,
  },
  {
    key: "confidence",
    type: "scale",
    question: "How confident do you feel about your career direction right now?",
    labels: ["Not confident", "Very confident"],
  },
];

const FINISH_STEP = questions.length + 1;
const THANKS_STEP = questions.length + 2;

type Outcome = "account" | "confirm-email" | "anonymous";

function failureMessage(result: SubmitSurveyResult | null): string {
  if (result && !result.ok && result.reason === "busy") {
    return "Too many surveys from this connection. Please try again later.";
  }
  if (result && !result.ok && result.reason === "unavailable") {
    return "The survey can't be saved right now. Please try again later.";
  }
  return "Your answers couldn't be saved. Please try again.";
}

function SurveyPage() {
  const auth = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    source: undefined,
    role: undefined,
    industries: [],
    needs: [],
    confidence: undefined,
  });
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submitted = useRef<{ id: string; claimToken: string | null } | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to each new step's heading (not on the first render).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, mode]);

  const question = step >= 1 && step <= questions.length ? questions[step - 1] : undefined;

  const answered = (() => {
    if (!question) return true;
    if (question.type === "multi") return draft[question.key].length > 0;
    return draft[question.key] !== undefined;
  })();

  function finalAnswers(): SurveyAnswers | null {
    const parsed = surveyAnswersSchema.safeParse(draft);
    return parsed.success ? parsed.data : null;
  }

  /** Saves the answers once; later calls return the same result. */
  async function submitOnce(): Promise<{ id: string; claimToken: string | null } | string> {
    if (submitted.current) return submitted.current;
    const answers = finalAnswers();
    if (!answers) return "Some answers are missing. Go back and answer every question.";
    const result = await submitSurvey({
      data: { answers, website: honeypotRef.current?.value ?? "" },
    }).catch(() => null);
    if (!result || !result.ok) return failureMessage(result);
    submitted.current = { id: result.id, claimToken: result.claimToken };
    return submitted.current;
  }

  async function submitDirectly(nextOutcome: Outcome) {
    setBusy(true);
    setError("");
    const result = await submitOnce();
    setBusy(false);
    if (typeof result === "string") {
      setError(result);
      return;
    }
    setOutcome(nextOutcome);
    setStep(THANKS_STEP);
  }

  const toggleMulti = (key: "industries" | "needs", value: string) =>
    setDraft((previous) => ({
      ...previous,
      [key]: previous[key].includes(value)
        ? previous[key].filter((entry) => entry !== value)
        : [...previous[key], value],
    }));

  const totalSegments = questions.length + 2;

  return (
    <div className="flex flex-1 items-start justify-center bg-light-blue px-4 py-12 sm:py-16">
      <div className="w-full max-w-[34rem] border border-border bg-background p-6 sm:p-10">
        <div
          role="progressbar"
          aria-label="Survey progress"
          aria-valuemin={1}
          aria-valuemax={totalSegments}
          aria-valuenow={Math.min(step + 1, totalSegments)}
          className="mb-8 flex gap-1.5"
        >
          {Array.from({ length: totalSegments }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1 flex-1",
                index < step ? "bg-blue" : index === step ? "bg-navy" : "bg-border",
              )}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="space-y-6">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-semibold leading-snug text-navy outline-none sm:text-3xl"
            >
              Before we start.
            </h1>
            <p className="text-charcoal/80">
              FutureWise is a free resource built for high school students in Oman. We're still
              early, so what we make next — the industry guides, the practical skills content,
              everything — should be shaped by the people actually using it.
            </p>
            <p className="text-charcoal/80">
              This survey has five quick questions, about two minutes in total. Your answers tell us
              which industries to cover first, what students find hardest to figure out, and how
              confident you already feel about your next steps. There are no right answers, and you
              can share as much or as little as you like.
            </p>
            <p className="text-sm text-charcoal/65">
              Every response goes straight to the FutureWise team and is used only to build better
              resources for students.
            </p>
          </div>
        ) : null}

        {question ? (
          <QuestionView
            question={question}
            draft={draft}
            headingRef={headingRef}
            onSingle={(key, value) => setDraft((previous) => ({ ...previous, [key]: value }))}
            onToggle={toggleMulti}
            onScale={(value) => setDraft((previous) => ({ ...previous, confidence: value }))}
          />
        ) : null}

        {step === FINISH_STEP ? (
          <div className="space-y-6">
            {/* Honeypot: hidden from people and screen readers. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="survey-website">Website</label>
              <input
                ref={honeypotRef}
                id="survey-website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {auth.status === "signed-in" ||
            auth.status === "unavailable" ||
            auth.status === "loading" ? (
              <>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-2xl font-semibold leading-snug text-navy outline-none sm:text-3xl"
                >
                  You're almost there.
                </h1>
                <p className="text-charcoal/80">
                  {auth.status === "signed-in"
                    ? `Your answers will be saved to your account${auth.profile?.full_name ? `, ${auth.profile.full_name}` : ""}.`
                    : "Send your answers to the FutureWise team."}
                </p>
                {error ? (
                  <p
                    role="alert"
                    className="border-l-2 border-destructive pl-3 text-sm text-destructive"
                  >
                    {error}
                  </p>
                ) : null}
                <Button
                  type="button"
                  className="h-11 w-full"
                  disabled={busy || auth.status === "loading"}
                  onClick={() =>
                    submitDirectly(auth.status === "signed-in" ? "account" : "anonymous")
                  }
                >
                  {busy ? "Saving…" : "Submit my answers"}
                </Button>
              </>
            ) : mode === "signup" ? (
              <>
                <div>
                  <h1
                    ref={headingRef}
                    tabIndex={-1}
                    className="text-2xl font-semibold leading-snug text-navy outline-none sm:text-3xl"
                  >
                    You're almost there.
                  </h1>
                  <p className="mt-3 text-charcoal/80">
                    Create a free account to save your answers and get notified when new resources
                    are ready.
                  </p>
                </div>
                <SignUpForm
                  submitLabel="Sign up and submit"
                  beforeSignUp={async () => {
                    const result = await submitOnce();
                    if (typeof result === "string") return { ok: false, message: result };
                    if (result.claimToken) savePendingClaim(result.id, result.claimToken);
                    return { ok: true };
                  }}
                  onSuccess={({ needsConfirmation }) => {
                    setOutcome(needsConfirmation ? "confirm-email" : "account");
                    setStep(THANKS_STEP);
                  }}
                />
                <FinishLinks
                  onSwitch={() => setMode("login")}
                  switchLabel="Already have an account? Log in"
                  onSkip={() => submitDirectly("anonymous")}
                  busy={busy}
                  error={error}
                />
              </>
            ) : (
              <>
                <div>
                  <h1
                    ref={headingRef}
                    tabIndex={-1}
                    className="text-2xl font-semibold leading-snug text-navy outline-none sm:text-3xl"
                  >
                    Log in to save your answers.
                  </h1>
                  <p className="mt-3 text-charcoal/80">
                    Your answers will be added to your account.
                  </p>
                </div>
                <LogInForm
                  submitLabel="Log in and submit"
                  onSuccess={async () => {
                    const result = await submitOnce();
                    if (typeof result === "string") {
                      setError(result);
                      return;
                    }
                    // An earlier anonymous save is attached by the sign-in follow-up.
                    if (result.claimToken) savePendingClaim(result.id, result.claimToken);
                    setOutcome("account");
                    setStep(THANKS_STEP);
                  }}
                />
                <FinishLinks
                  onSwitch={() => setMode("signup")}
                  switchLabel="New here? Create an account"
                  onSkip={() => submitDirectly("anonymous")}
                  busy={busy}
                  error={error}
                />
              </>
            )}
          </div>
        ) : null}

        {step === THANKS_STEP ? <ThanksView outcome={outcome} headingRef={headingRef} /> : null}

        {step < FINISH_STEP ? (
          <div className="mt-10 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11"
                onClick={() => setStep((s) => s - 1)}
              >
                Previous
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              variant="survey"
              size="lg"
              className="h-11 min-w-[7rem]"
              disabled={!answered}
              onClick={() => setStep((s) => s + 1)}
            >
              {step === 0 ? "Get started" : "Next"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FinishLinks({
  onSwitch,
  switchLabel,
  onSkip,
  busy,
  error,
}: {
  onSwitch: () => void;
  switchLabel: string;
  onSkip: () => void;
  busy: boolean;
  error: string;
}) {
  return (
    <div className="space-y-3 border-t border-border pt-5 text-sm">
      <button
        type="button"
        onClick={onSwitch}
        className="min-h-6 font-semibold text-navy underline-offset-2 hover:underline"
      >
        {switchLabel}
      </button>
      <div>
        <button
          type="button"
          onClick={onSkip}
          disabled={busy}
          className="min-h-6 text-charcoal/75 underline underline-offset-2 hover:text-navy disabled:opacity-50"
        >
          {busy ? "Saving…" : "Submit without an account"}
        </button>
      </div>
      {error ? (
        <p role="alert" className="border-l-2 border-destructive pl-3 text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function QuestionView({
  question,
  draft,
  headingRef,
  onSingle,
  onToggle,
  onScale,
}: {
  question: Question;
  draft: Draft;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onSingle: (key: "source" | "role", value: string) => void;
  onToggle: (key: "industries" | "needs", value: string) => void;
  onScale: (value: number) => void;
}) {
  const heading = (
    <h1
      ref={headingRef}
      tabIndex={-1}
      id="survey-question"
      className="text-2xl font-semibold leading-snug text-navy outline-none sm:text-3xl"
    >
      {question.question}
    </h1>
  );

  if (question.type === "scale") {
    return (
      <div className="space-y-6">
        {heading}
        <div role="radiogroup" aria-labelledby="survey-question" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={draft.confidence === value}
                aria-label={`${value} of 5`}
                onClick={() => onScale(value)}
                className={cn(
                  "flex size-12 items-center justify-center border text-lg font-semibold transition-colors",
                  draft.confidence === value
                    ? "border-navy bg-navy text-primary-foreground"
                    : "border-border bg-background text-charcoal hover:border-navy/60",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium text-charcoal/70">
            <span>{question.labels[0]}</span>
            <span>{question.labels[1]}</span>
          </div>
        </div>
      </div>
    );
  }

  if (question.type === "multi") {
    const selected = draft[question.key];
    return (
      <div className="space-y-6">
        {heading}
        <p className="text-sm text-charcoal/65">Choose all that apply.</p>
        <div role="group" aria-labelledby="survey-question" className="grid gap-3">
          {question.options.map((option) => {
            const checked = selected.includes(option);
            const optionId = `${question.key}-${option.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
            return (
              <label
                key={option}
                htmlFor={optionId}
                className={cn(
                  "flex min-h-12 cursor-pointer items-center gap-3 border p-4 transition-colors",
                  checked
                    ? "border-navy bg-light-blue"
                    : "border-border bg-background hover:border-navy/50",
                )}
              >
                <Checkbox
                  id={optionId}
                  checked={checked}
                  onCheckedChange={() => onToggle(question.key, option)}
                  className="border-navy data-[state=checked]:bg-navy data-[state=checked]:text-primary-foreground"
                />
                <span className="text-base font-medium text-charcoal">{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {heading}
      <RadioGroup
        aria-labelledby="survey-question"
        value={draft[question.key] ?? ""}
        onValueChange={(value) => onSingle(question.key, value)}
        className="grid gap-3"
      >
        {question.options.map((option) => {
          const optionId = `${question.key}-${option.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
          return (
            <label
              key={option}
              htmlFor={optionId}
              className={cn(
                "flex min-h-12 cursor-pointer items-center gap-3 border p-4 transition-colors",
                draft[question.key] === option
                  ? "border-navy bg-light-blue"
                  : "border-border bg-background hover:border-navy/50",
              )}
            >
              <RadioGroupItem id={optionId} value={option} className="border-navy text-navy" />
              <span className="text-base font-medium text-charcoal">{option}</span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

function ThanksView({
  outcome,
  headingRef,
}: {
  outcome: Outcome | null;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="space-y-5 py-4">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-semibold leading-snug text-navy outline-none sm:text-3xl"
      >
        {outcome === "confirm-email" ? "Check your inbox." : "Thank you for sharing."}
      </h1>
      {outcome === "confirm-email" ? (
        <p className="text-charcoal/80">
          We've sent you an email to confirm your address. Your answers are saved: they'll be added
          to your account when you log in after confirming.
        </p>
      ) : outcome === "account" ? (
        <p className="text-charcoal/80">
          Your answers are saved to your account. They help us build resources that actually matter
          to students in Oman.
        </p>
      ) : (
        <p className="text-charcoal/80">
          Your answers help us build resources that actually matter to students in Oman.
        </p>
      )}
      <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
        {outcome === "account" ? (
          <Link to="/account" className="text-link">
            Go to your account
          </Link>
        ) : null}
        <Link to="/industry-resources" className="text-link">
          Explore Industry Insights
        </Link>
        <Link to="/resources" className="text-link">
          Browse resources
        </Link>
      </div>
    </div>
  );
}
