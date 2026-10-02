export function PlaceholderPage({
  title,
  eyebrow,
  description = "FutureWise is preparing this guide for students in Oman.",
}: {
  title: string;
  eyebrow: string;
  description?: string;
}) {
  return (
    <section className="page-intro">
      <div className="site-container py-20 sm:py-28">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-bold text-navy sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-charcoal/80">{description}</p>
        </div>
      </div>
    </section>
  );
}
