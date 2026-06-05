import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { isTeamLead } from '@repo/permissions'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentUser } from 'state/currentUser/selectors'

export function useCopilotEnabled(): boolean {
    const isFlagEnabled = useFlag(FeatureFlagKey.EnableCopilotUi, false)
    const currentUser = useAppSelector(getCurrentUser)

    return isFlagEnabled && isTeamLead(currentUser.toJS())
}
