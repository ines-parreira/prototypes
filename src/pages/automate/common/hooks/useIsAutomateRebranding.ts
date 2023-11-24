import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export const useIsAutomateRebranding = () => {
    const isAutomateRebranding = useFlags()[FeatureFlagKey.AutomateRebranding]
    const url = isAutomateRebranding ? '/app/settings' : '/app/automation'
    return {
        macrosUrl: `${url}/macros`,
        rulesUrl: `${url}/rules`,
        ticketAssignmentUrl: `${url}/ticket-assignment`,
        isAutomateRebranding,
        baseUrl: url,
    }
}
