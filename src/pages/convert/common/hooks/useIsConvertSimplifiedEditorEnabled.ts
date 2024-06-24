import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'

export const useIsConvertSimplifiedEditorEnabled = (): boolean => {
    const flags = useFlags()

    return !!flags[FeatureFlagKey.ConvertSimplifiedEditor]
}
