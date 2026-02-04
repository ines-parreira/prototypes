import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { useLocation } from 'react-router-dom'

export function useHelpdeskV2MS1Dot5Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const hasUIVisionMilestone1 = useFlag(FeatureFlagKey.UIVisionMilestone1)
    const hasUIVisionMilestone1Dot5 = useFlag(
        FeatureFlagKey.UIVisionMilestone1Dot5,
    )
    const isMobileResolution = useIsMobileResolution()
    const { pathname } = useLocation()

    const isNewTicketPage = pathname.includes('/app/ticket/new')

    return (
        hasUIVisionBeta &&
        hasUIVisionMilestone1 &&
        hasUIVisionMilestone1Dot5 &&
        !isMobileResolution &&
        isNewTicketPage
    )
}
