export default function ConclusionSection({ id }: { id: string }) {
  return (
    <section id={id} className="py-12">
      <div className="bg-[var(--color-royal)]/10 rounded container mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Conclusion</h2>
        <div>
          <h3 className="font-bold text-xl">Findings</h3>
          <p>
            Our analysis highlights routes and neighborhoods with the highest
            estimated risk of accidents, guiding potential safety interventions.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl">Recommendations</h3>
          <p>
            Prioritize enforcement and infrastructure improvements on high-risk
            routes; increase rider safety education where applicable.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl">Limitations</h3>
          <p>
            Data availability varies by time and location; some violations may
            be underreported; additional factors (weather, driver behavior) were
            not included.
          </p>
        </div>
      </div>
    </section>
  );
}
