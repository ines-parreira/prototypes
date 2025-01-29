import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isTeamLead} from 'utils'

export default function useHasAutoQA() {
    const hasAutoQAFlag = useFlag(FeatureFlagKey.AutoQA)
    const currentUser = useAppSelector(getCurrentUser)

    return useMemo(
        () => hasAutoQAFlag && isTeamLead(currentUser),
        [currentUser, hasAutoQAFlag]
    )
}
