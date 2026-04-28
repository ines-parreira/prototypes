import Clarity from '@microsoft/clarity'
import { FeatureFlagKey, fetchFlag } from '@repo/feature-flags'
import { isProduction, isStaging } from '@repo/utils'

const CLARITY_PROJECT_ID = 'wgwg1vy3fk'

function logClarityDebug(...args: Array<unknown>) {
    if (!isProduction()) {
        // eslint-disable-next-line no-console
        console.log(...args)
    }
}

export async function initClarity() {
    if (!isStaging() && !isProduction()) {
        logClarityDebug('[Clarity] skipped: unsupported environment')
        return
    }

    const { flag: isClarityEnabled, error } = await fetchFlag(
        FeatureFlagKey.HelpdeskMicrosoftClarity,
        false,
    )

    logClarityDebug('[Clarity] flag evaluation', {
        error: error?.message ?? null,
        isClarityEnabled,
        projectId: CLARITY_PROJECT_ID,
    })

    if (isClarityEnabled) {
        try {
            Clarity.init(CLARITY_PROJECT_ID)
            logClarityDebug('[Clarity] init succeeded', {
                projectId: CLARITY_PROJECT_ID,
            })
        } catch (initError) {
            logClarityDebug('[Clarity] init failed', initError)
        }
    } else {
        logClarityDebug('[Clarity] skipped: flag disabled')
    }
}
