import test from "node:test";
import assert from "node:assert/strict";
import { linkRelatedArticles } from "../../src/lib/related-articles.ts";

const posts = [
  {
    slug: "how-banks-work-in-oman-a-students-guide-to-banking",
    title: "How Banks Work in Oman: A Student's Guide to Banking",
  },
  {
    slug: "emergency-funds-and-insurance-building-your-financial-safety-net",
    title: "Emergency Funds and Insurance: Building Your Financial Safety Net",
  },
  {
    slug: "budgeting-101-how-to-manage-your-money-before-you-earn-a-full-time-salary",
    title: "Budgeting 101: How to Manage Your Money Before You Earn a Full-Time Salary",
  },
];

test("related articles that exist become links; the others stay plain text", () => {
  const body =
    "Intro.\n\nRelated FutureWise articles: Budgeting 101; How Banks Work in Oman; Loans 101.\n\nDisclaimer: Educational purposes only.";
  assert.equal(
    linkRelatedArticles(body, posts),
    "Intro.\n\nRelated FutureWise articles: [Budgeting 101](/blog/budgeting-101-how-to-manage-your-money-before-you-earn-a-full-time-salary); [How Banks Work in Oman](/blog/how-banks-work-in-oman-a-students-guide-to-banking); Loans 101.\n\nDisclaimer: Educational purposes only.",
  );
});

test("'&' matches 'and', and a matched last name keeps its full stop outside the link", () => {
  assert.equal(
    linkRelatedArticles("Related FutureWise articles: Emergency Funds & Insurance.", posts),
    "Related FutureWise articles: [Emergency Funds & Insurance](/blog/emergency-funds-and-insurance-building-your-financial-safety-net).",
  );
});

test("a post never links to itself, and other lines are left alone", () => {
  const body =
    "Budgeting 101 is mentioned here.\nRelated FutureWise articles: Budgeting 101; Emergency Funds & Insurance.";
  const slug = posts[2]?.slug;
  assert.equal(
    linkRelatedArticles(body, posts, slug),
    "Budgeting 101 is mentioned here.\nRelated FutureWise articles: Budgeting 101; [Emergency Funds & Insurance](/blog/emergency-funds-and-insurance-building-your-financial-safety-net).",
  );
});

test("names that are already links, and bodies without the line, are unchanged", () => {
  const linked =
    "Related FutureWise articles: [Budgeting 101](/blog/budgeting-101-how-to-manage-your-money-before-you-earn-a-full-time-salary).";
  assert.equal(linkRelatedArticles(linked, posts), linked);
  assert.equal(linkRelatedArticles("No related line.", posts), "No related line.");
  assert.equal(
    linkRelatedArticles("Related FutureWise articles: Budgeting 101.", []),
    "Related FutureWise articles: Budgeting 101.",
  );
});
