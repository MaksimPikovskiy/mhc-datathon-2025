export default function DictionarySection({ id = "" }: { id?: string }) {
  return (
    <section id={id} className="container mx-auto px-4 space-y-6 pt-12">
      <h2 className="text-2xl font-bold">Dictionary of Terms</h2>
      <p className="text-gray-600 text-sm">
        Quick reference for key terms and acronyms used throughout this report.
      </p>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">
            ACE (Automated Camera Enforcement)
          </dt>
          <dd className="text-sm text-gray-700">
            NYC program that uses bus-mounted camera systems to detect bus lane,
            bus stop, and parking violations along bus routes.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">ABLE</dt>
          <dd className="text-sm text-gray-700">
            “Automated Bus Lane Enforcement” - similar to ACE but focused on bus
            lane priority enforcement on select corridors.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">
            Double Parked Violation
          </dt>
          <dd className="text-sm text-gray-700">
            A violation that occurs when a bus is blocked by or stops next to a
            double-parked vehicle, potentially causing delays or unsafe
            conditions.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">Bus Stop Violation</dt>
          <dd className="text-sm text-gray-700">
            A violation that is recorded when a bus is obstructed or stops
            improperly at a bus stop.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">Bus Lane Violation</dt>
          <dd className="text-sm text-gray-700">
            A violation that is recorded when a vehicle blocks or drives in a
            dedicated bus lane, interfering with bus flow and schedule
            adherence.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">Ridership</dt>
          <dd className="text-sm text-gray-700">
            Average number of passengers boarding buses (plus transfers) on a
            given route or neighborhood.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">Speed</dt>
          <dd className="text-sm text-gray-700">
            The average operating speed of a bus on a route or the average
            operating speed of a buses operating within a neighborhood.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">Neighborhood (NTA)</dt>
          <dd className="text-sm text-gray-700">
            NYC Neighborhood Tabulation Areas (NTAs) used to aggregate
            violations, speeds, and ridership data spatially.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">Risk Score</dt>
          <dd className="text-sm text-gray-700">
            Composite metric combining violations, bus speeds, and ridership to
            estimate the likelihood of accidents or serious incidents. We
            utilize a weighted average in this report instead of weighted sum.
          </dd>
        </div>

        <div className="bg-[var(--color-royal)]/5 rounded-2xl p-4">
          <dt className="font-semibold text-primary">Normalized Value</dt>
          <dd className="text-sm text-gray-700">
            A rescaled number (0–1) so different factors can be compared fairly
            within the risk score formula.
          </dd>
        </div>
      </dl>
    </section>
  );
}
