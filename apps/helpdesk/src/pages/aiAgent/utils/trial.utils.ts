import type { AutomatePlan } from 'models/billing/types'

/* *
 * Determine if the store has an automate plan with generation 6 or higher.
 * Used to determine behavior of multiple features.
 *
 * @param currentAutomatePlan - the current automate plan
 * @returns true if the store has an automate plan with generation 6 or higher, false otherwise
 */
export const hasAutomatePlanAboveGen6 = (
    currentAutomatePlan: AutomatePlan | undefined,
) => {
    return (currentAutomatePlan?.generation ?? 0) >= 6
}
