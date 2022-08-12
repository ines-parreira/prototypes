import {useContext} from 'react'

import FeatureFlagsContext from 'providers/FeatureFlags/context'

export function useFeatureFlags() {
    return useContext(FeatureFlagsContext)
}
