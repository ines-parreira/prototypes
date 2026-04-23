import { buildFlagContext } from './engines/context'
import * as harness from './engines/harness'

export function initFeatureFlagsClient(
    user: { id: string },
    account: { id: string; domain: string },
    currentHelpdeskProductId?: string,
    currentAutomationProductId?: string,
): void {
    const flagContext =
        user && account
            ? buildFlagContext(
                  user,
                  account,
                  currentHelpdeskProductId,
                  currentAutomationProductId,
              )
            : { key: 'anonymous', attributes: {} }

    harness.initialize(flagContext)
}
