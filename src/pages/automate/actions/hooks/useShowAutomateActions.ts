import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from '../../../../config/featureFlags'

export default function useShowAutomateActions(): boolean {
    const allowedActions: string[] | Record<never, never> | undefined =
        useFlags()[FeatureFlagKey.ActionTemplates]

    return (
        (Array.isArray(allowedActions) && allowedActions.length > 0) || // some templates allowed
        (!Array.isArray(allowedActions) && !!allowedActions) // all templates allowed
    )
}
