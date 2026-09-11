import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/survey")({
  head: () => ({
    meta: [
      { title: "Take the Survey | FutureWise" },
      {
        name: "description",
        content:
          "Share your perspective and help FutureWise create resources that work for students in Oman.",
      },
      {
        property: "og:title",
        content: "Take the Survey | FutureWise",
      },
      {
        property: "og:description",
        content:
          "Share your perspective and help FutureWise create resources that work for students in Oman.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

type SurveyAnswers = {
  source: string | undefined;
  role: string | undefined;
  industries: string[];
  needs: string[];
  confidence: string | undefined;
};

type SignupInfo = {
  name: string;
  email: string;
  password: string;
};

type Question =
  | {
      key: "source" | "role";
      type: "single";
      question: string;
      options: string[];
    }
  | {
      key: "industries" | "needs";
      type: "multi";
      question: string;
      options: string[];
    }
  | {
      key: "confidence";
      type: "scale";
      question: string;
      scale: string[];
      labels: [string, string];
    };

const questions: Question[] = [
  {
    key: "source",
    type: "single",
    question: "How did you hear about FutureWise?",
    options: ["School", "Friend", "LinkedIn", "Instagram", "Parent/Teacher", "Other"],
  },
  {
    key: "role",
    type: "single",
    question: "Which best describes you?",
    options: [
      "High school student",
      "University student",
      "Parent",
      "Educator",
      "Industry professional",
      "Other",
    ],
  },
  {
    key: "industries",
    type: "multi",
    question: "Which industries are you most interested in?",
    options: [
      "Law",
      "Entrepreneurship",
      "Investment Banking & Trading",
      "Other Finance",
      "Tax",
      "Economics",
      "Operations",
      "Not sure yet",
    ],
  },
  {
    key: "needs",
    type: "multi",
    question: "What do you need the most help with right now?",
    options: [
      "Understanding industries",
      "Career readiness",
      "Personal finance",
      "Independent living skills",
      "Other",
    ],
  },
  {
    key: "confidence",
    type: "scale",
    question: "How confident do you feel about your career direction right now?",
    scale: ["1", "2", "3", "4", "5"],
    labels: ["Not confident", "Very confident"],
  },
];

function Page() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [answers, setAnswers] = useState<SurveyAnswers>({
    source: undefined,
    role: undefined,
    industries: [],
    needs: [],
    confidence: undefined,
  });
  const [signup, setSignup] = useState<SignupInfo>({ name: "", email: "", password: "" });

  const totalSteps = questions.length + 1;
  const isSignupStep = step === questions.length;
  const isThanksStep = step === totalSteps;

  const currentAnswer = (() => {
    if (step >= questions.length) return undefined;
    const q = questions[step];
    if (q.type === "multi") return answers[q.key];
    return answers[q.key];
  })();

  const canProceed = () => {
    if (isSignupStep) {
      return Boolean(signup.name.trim() && signup.email.trim() && signup.password.trim());
    }
    if (isThanksStep) return true;
    return Array.isArray(currentAnswer) ? currentAnswer.length > 0 : Boolean(currentAnswer);
  };

  const goNext = () => {
    if (!canProceed()) return;
    setVisible(false);
    setTimeout(() => {
      setStep((s) => s + 1);
      setVisible(true);
    }, 200);
  };

  const updateSingle = (value: string) => {
    if (step >= questions.length) return;
    const q = questions[step];
    if (q.type === "single" || q.type === "scale") {
      setAnswers((prev) => ({ ...prev, [q.key]: value } as SurveyAnswers));
    }
  };

  const toggleMulti = (value: string) => {
    if (step >= questions.length) return;
    const q = questions[step];
    if (q.type !== "multi") return;
    setAnswers((prev) => {
      const current = prev[q.key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [q.key]: next } as SurveyAnswers;
    });
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-light-blue px-4 py-12 sm:py-16">
      <div className="w-full max-w-[32rem] rounded-card bg-white p-6 shadow-soft sm:p-10">
        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2" aria-label="Survey progress">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-2.5 rounded-full transition-colors duration-200",
                i < step ? "bg-teal" : i === step ? "bg-navy" : "bg-light-grey",
              )}
            />
          ))}
        </div>

        <div
          className={cn(
            "transition-opacity duration-200 ease-in-out",
            visible ? "opacity-100" : "opacity-0",
          )}
        >
          {isThanksStep ? (
            <ThanksView />
          ) : isSignupStep ? (
            <SignupView
              signup={signup}
              setSignup={setSignup}
              onSubmit={goNext}
              canProceed={canProceed()}
            />
          ) : (
            <QuestionView
              question={questions[step]}
              answers={answers}
              onSingleChange={updateSingle}
              onMultiToggle={toggleMulti}
            />
          )}
        </div>

        {!isThanksStep && (
          <div className="mt-10 flex justify-end">
            <Button
              type="button"
              variant="survey"
              size="lg"
              onClick={goNext}
              disabled={!canProceed()}
              className="min-w-[6.5rem]"
            >
              {isSignupStep ? "Sign Up" : "OK"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionView({
  question,
  answers,
  onSingleChange,
  onMultiToggle,
}: {
  question: Question;
  answers: SurveyAnswers;
  onSingleChange: (value: string) => void;
  onMultiToggle: (value: string) => void;
}) {
  if (question.type === "scale") {
    const selected = answers.confidence;
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold leading-snug text-navy sm:text-3xl">
          {question.question}
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            {question.scale.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSingleChange(value)}
                className={cn(
                  "flex size-12 items-center justify-center rounded-full border-2 text-lg font-semibold transition-colors",
                  selected === value
                    ? "border-teal bg-teal text-navy"
                    : "border-light-grey bg-white text-charcoal hover:border-teal/60",
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
    const selected = answers[question.key];
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold leading-snug text-navy sm:text-3xl">
          {question.question}
        </h2>
        <div className="grid gap-3">
          {question.options.map((option) => {
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                  checked
                    ? "border-teal bg-light-blue"
                    : "border-light-grey bg-white hover:border-teal/50",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onMultiToggle(option)}
                  className="border-navy data-[state=checked]:bg-teal data-[state=checked]:text-navy"
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
      <h2 className="text-2xl font-semibold leading-snug text-navy sm:text-3xl">
        {question.question}
      </h2>
      <RadioGroup
        value={answers[question.key] ?? null}
        onValueChange={onSingleChange}
        className="grid gap-3"
      >
        {question.options.map((option) => (
          <label
            key={option}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
              answers[question.key] === option
                ? "border-teal bg-light-blue"
                : "border-light-grey bg-white hover:border-teal/50",
            )}
          >
            <RadioGroupItem
              value={option}
              className="border-navy text-navy data-[state=checked]:border-teal"
            />
            <span className="text-base font-medium text-charcoal">{option}</span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

function SignupView({
  signup,
  setSignup,
  onSubmit,
  canProceed,
}: {
  signup: SignupInfo;
  setSignup: React.Dispatch<React.SetStateAction<SignupInfo>>;
  onSubmit: () => void;
  canProceed: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold leading-snug text-navy sm:text-3xl">
          You're almost there.
        </h2>
        <p className="mt-3 text-charcoal/75">
          Create a free account to save your answers and get notified when new resources are ready.
        </p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canProceed) onSubmit();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="name" className="text-charcoal">
            Name
          </Label>
          <Input
            id="name"
            value={signup.name}
            onChange={(e) => setSignup((s) => ({ ...s, name: e.target.value }))}
            placeholder="Your full name"
            className="border-light-grey text-charcoal placeholder:text-charcoal/40 focus-visible:ring-teal"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-charcoal">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={signup.email}
            onChange={(e) => setSignup((s) => ({ ...s, email: e.target.value }))}
            placeholder="you@example.com"
            className="border-light-grey text-charcoal placeholder:text-charcoal/40 focus-visible:ring-teal"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-charcoal">
            Create Password
          </Label>
          <Input
            id="password"
            type="password"
            value={signup.password}
            onChange={(e) => setSignup((s) => ({ ...s, password: e.target.value }))}
            placeholder="••••••••"
            className="border-light-grey text-charcoal placeholder:text-charcoal/40 focus-visible:ring-teal"
          />
        </div>
      </form>
      <p className="text-center text-sm text-charcoal/70">
        Already have an account?{" "}
        <span className="cursor-not-allowed font-semibold text-blue opacity-70">Log in</span>
      </p>
    </div>
  );
}

function ThanksView() {
  return (
    <div className="space-y-5 py-6 text-center">
      <h2 className="text-2xl font-semibold leading-snug text-navy sm:text-3xl">
        Thank you for sharing.
      </h2>
      <p className="text-charcoal/75">
        Your answers help us build resources that actually matter to students in Oman.
      </p>
      <Button asChild variant="survey" size="lg" className="mt-2">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
