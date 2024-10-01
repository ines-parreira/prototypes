import {useMemo} from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isAdmin} from 'utils'

export default function useHasAutoQA() {
    const hasAutoQAFlag = useFlag<boolean>(FeatureFlagKey.AutoQA, false)
    const currentUser = useAppSelector(getCurrentUser)

    return useMemo(
        () => hasAutoQAFlag && isAdmin(currentUser),
        [currentUser, hasAutoQAFlag]
    )
}
