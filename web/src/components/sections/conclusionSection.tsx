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
            <ul className="list-disc list-outside ps-4 space-y-2 my-2">
              <li>
                M15+ and M101 bus routes stretch nearly across entire Manhattan
                and possess a Risk Score of ~0.594 and ~0.541, respectively.
                <ul className="list-[circle] list-outside ps-4">
                  <li>
                    This could be due to the longer length of the bus routes.
                  </li>
                </ul>
              </li>
              <li>
                Despite BX19 being a shorter route compared to M15+ and M101, it
                possesses a Risk Score of ~0.525, which comparatively speaking is
                close to Risk Scores of M15+ and M101.
              </li>
              <li>
                Other bus routes posses a Risk Score lower than 0.400, which
                suggests less need of intervention and fewer ACE-supplied buses.
              </li>
              <li>
                BX3, BX7, BX20, BX38, M4, M14+, M42, M100, Q6 bus routes are
                mostly short routes, seeing fewer ridership and violations.
                <ul className="list-[circle] list-outside ps-4">
                  <li>Thus, their Risk Score is 0.000.</li>
                </ul>
              </li>
              <li>
                Jamaica Neighborhood possesses the highest Risk Score, ~0.562.
                <ul className="list-[circle] list-outside ps-4">
                  <li>
                    Jamaica has the most total violations, with the total weight
                    of them being 0.58.
                  </li>
                </ul>
              </li>
              <li>
                Longwood, Washington Heights (South), and East Harlem (North)
                come in after Jaimaca with high Risk Score of ~0.520, ~0,505,
                and ~0.482 (respectively).
                <ul className="list-[circle] list-outside ps-4">
                  <li>
                    Longwood has the most double parked violations, our biggest
                    risk factor (weight of 0.28).
                  </li>
                  <li>
                    BX36 and M101, highest-risk bus routes, are the bus routes
                    that serve Washington Heights (South) neighborhood.
                  </li>
                  <li>
                    M15+ and M101, highest-risk bus routes, are the bus routes
                    that serve East Harlem (North) neighborhood.
                  </li>
                </ul>
              </li>
              <li>
                Upper East Side-Lenox Hill-Roosevelt Island, Upper East
                Side-Yorkville, Flatbush, and East Flatbush-Rugby have Risk
                Scores of ~0.455, ~0.442, ~0.437, and ~0.421 (respectively).
                <ul className="list-[circle] list-outside ps-4">
                  <li>
                    M15+ and M101, highest-risk bus routes, are the bus routes
                    that serve Upper East Side-Lenox Hill-Roosevelt Island and
                    Upper East Side-Yorkville neighborhoods.
                  </li>
                  <li>
                    Flatbush and East Flatbush-Rugby are within top-10 of
                    highest total violations (main contributor is bus stop
                    violations)
                  </li>
                </ul>
              </li>
              <li>
                The other neighborhoods possess a Risk Score of close to ~0.400
                or less.
              </li>
              <ul className="list-[circle] list-outside ps-4">
                <li>
                  Safety intervention is not priority within a reasonable
                  timeframe for these neighborhoods.
                </li>
              </ul>
            </ul>
            Ultimately, the data suggests a reallocation of the ACE-supplied
            routes from lower-risk routes to higher-risk routes. Bus routes with
            lower-risk should continue to have ACE-supplied buses, but in fewer
            quantity than higher-risk routes. For neighborhoods, this means
            focusing resources where violations and ridership density combine to
            create the highest potential for accidents — for example, Jamaica,
            Longwood, Washington Heights (South), and East Harlem (North).
            Neighborhoods with Risk Scores near or below 0.400 should still be
            monitored but may warrant fewer interventions or longer review
            cycles, allowing resources to be concentrated where they are most
            needed.
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl">Recommendations</h3>
          <p className="text-start md:mx-16">
            <ul className="list-disc list-outside ps-4 space-y-2 my-2">
              <li>
                Prioritize enforcement and infrastructure improvements on
                high-risk routes.
              </li>
              <li>Introduce more bus routes to ACE program.</li>
              <li>
                Reallocate ACE buses from lesser-risk bus routes to higher-risk
                ones.
                <ul className="list-[circle] list-outside ps-4 space-y-2 my-2">
                  <li>
                    Or introduce more ACE buses into the system (either through
                    modernization or new bus).
                  </li>
                </ul>
              </li>
              <li>
                More ACE data will allow us to create a more accurate prediction
                of risk, which would allow MTA to have more detailed and
                reliable map and charts of risk score for bus routes or
                neighborhoods.
              </li>
            </ul>
          </p>
        </div>
        <div>
          <h3 className="font-bold text-xl">Limitations</h3>
          <p className="text-start md:mx-16">
            <ul className="list-disc list-outside ps-4 space-y-2 my-2">
              <li>Some violations may be underreported.</li>
              <li>
                Environmental factors (weather, road design, traffic signal
                timing, driver behavior) and socioeconomic variables are not
                included but may influence accident risk.
              </li>
              <li>There are bus routes that are not within ACE program.</li>
              <li>
                Longer bus routes may naturally accumulate more violations and
                ridership.
              </li>
              <li>
                The analysis does not account for the effectiveness of existing
                safety interventions.
                <ul className="list-[circle] list-outside ps-4 space-y-2 my-2">
                  <li>
                    High-risk areas may have ongoing mitigation efforts not
                    reflected in the current data.
                  </li>
                </ul>
              </li>
            </ul>
          </p>
        </div>
      </div>
    </section>
  );
}
