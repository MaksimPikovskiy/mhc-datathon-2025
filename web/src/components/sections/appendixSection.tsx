export default function AppendixSection({ id }: { id: string }) {
  return (
    <section id={id} className="container mx-auto px-4 space-y-4">
      <h2 className="text-2xl font-bold">Appendix</h2>
      <p>
        Complete Python scripts, SQL queries, and intermediate datasets used in
        the analysis can be accessed{" "}
        <a href="https://github.com/MaksimPikovskiy/mhc-datathon-2025" className="underline hover:text-primary/50">
          here
        </a>
        . This provides full transparency into how raw data became the risk
        scores displayed on this site.
      </p>
    </section>
  );
}
