import { AutomatePlan } from 'models/billing/types'
import { StoreIntegration } from 'models/integration/types'
import { ShopType } from 'models/selfServiceConfiguration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { hasAutomatePlanAboveGen6 } from 'pages/aiAgent/utils/trial.utils'

export type SectionKey = `${ShopType}:${string}`

export const getSectionKeyFromStoreIntegration = (
    integration: StoreIntegration,
): SectionKey => {
    return `${integration.type}:${getShopNameFromStoreIntegration(integration)}`
}

export type NavigationChannelType = 'chat' | 'email'

/* *
 * Get the name of the collapsed section in the navbar.
 *
 * The following rules apply:
 * - store had a trial in the past or has automate plan with generation 6 or higher (they don't have a trial)
 *   -> show `Get started` because they will see a paywall from now on
 * - doesn’t have automate plan
 *   -> show `Try for free` because this is the case of AI Agent trial
 * - has automate and no trial (now or in the past)
 *   -> show `Try for 14 days` because they already pay for AI Agent
 *
 * @param hasTrial - whether the store has or had a trial
 * @param currentAutomatePlan - the current automate plan
 * @returns the name of the collapsed section in the navbar
 */
export const getCollapsedSectionName = (
    hasTrial: boolean,
    currentAutomatePlan: AutomatePlan | undefined,
) => {
    if (hasTrial || hasAutomatePlanAboveGen6(currentAutomatePlan)) {
        return 'Get started'
    }

    if (!currentAutomatePlan) {
        return 'Try for free'
    }

    return 'Try for 14 days'
}
