export default function ResultsInterlude({ id }: { id: string }) {
  return (
    <section id={id} className="container mx-auto px-4 space-y-4 pt-12">
      <h2 className="text-2xl font-bold">Findings</h2>
      <p>
        With weights applied, we computed risk scores for each route and
        neighborhood. The following chart and map showcase the outcomes of our
        analysis.
      </p>
    </section>
  );
}
