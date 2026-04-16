import type * as LDClient from 'launchdarkly-js-client-sdk'

import { initEngines } from './dualEvaluation'
import { buildFlagContext } from './engines/context'
import * as ldEngine from './engines/launchdarkly'

export let LDContext: LDClient.LDContext = {}

export function _setLDContext(context: LDClient.LDContext) {
    LDContext = context
}

export function initLaunchDarkly(
    user: { id: string },
    account: { id: string; domain: string },
    currentHelpdeskProductId?: string,
    currentAutomationProductId?: string,
): LDClient.LDClient {
    const flagContext =
        user && account
            ? buildFlagContext(
                  user,
                  account,
                  currentHelpdeskProductId,
                  currentAutomationProductId,
              )
            : { key: '', attributes: {} }

    initEngines(flagContext)
    LDContext = ldEngine.getContext()
    return ldEngine.getRawClient()
}

export function getLDClient(): LDClient.LDClient {
    return ldEngine.getRawClient()
}
