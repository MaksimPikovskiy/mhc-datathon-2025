export default function ConclusionSection({ id }: { id: string }) {
  return (
    <section id={id} className="py-12">
      <div className="bg-[var(--color-royal)]/10 rounded container mx-auto p-4 space-y-4">
        <h2 className="text-2xl font-bold">Conclusion</h2>
        <div>
          <h3 className="font-bold text-xl">Findings</h3>
          <p className="text-start md:mx-16">
            Our analysis highlights routes and neighborhoods with the highest
            estimated risk of accidents.
            <ul className="list-disc list-outside ps-4">
              <li>
                M15+ and M101 bus routes stretch nearly across entire Manhattan
                and possess a Risk Score of ~0.588 and ~0.548, respectively.
                <ul className="list-disc list-outside ps-4">
                  <li>
                    This could be due to the longer length of the bus route.
                  </li>
                </ul>
              </li>
              <li>
                Despite BX19 being a shorter route compared to M15+ and M101, it
                possess a Risk Score of ~0.538, which comparatively speaking is
                close to Risk Scores of M15+ and M101.
              </li>
              <li>
                Other bus routes posses a Risk Score lower than 0.40, which
                suggests less need of intervention and fewer ACE-supplied buses.
              </li>
              <li>
                BX3, BX7, BX20, BX38, M4, M14+, M42, M100, Q6 bus routes are
                mostly short routes, seeing fewer ridership and violations.
                <ul className="list-[square] list-outside ps-4">
                  <li>Thus, their Risk Score is 0.</li>
                </ul>
              </li>
            </ul>
            Ultimately, the data suggests a reallocation of the ACE-supplied
            routes from lower-risk routes to higher-risk routes. Bus routes with
            lower-risk should continue to have ACE-supplied buses, but in fewer
            quantity than higher-risk routes.
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
