import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { useParams } from 'react-router-dom'

export function useHelpdeskV2MS1Dot5Flag() {
    const hasUIVisionBetaBaseline = useFlag(FeatureFlagKey.UIVisionBetaBaseline)
    const hasUIVisionMilestone1 = useFlag(FeatureFlagKey.UIVisionMilestone1)
    const hasUIVisionMilestone1Dot5 = useFlag(
        FeatureFlagKey.UIVisionMilestone1Dot5,
    )
    const isMobileResolution = useIsMobileResolution()

    const { ticketId } = useParams<{ ticketId: string }>()

    const isNewTicketPage = ticketId === 'new'

    return (
        hasUIVisionBetaBaseline &&
        hasUIVisionMilestone1 &&
        hasUIVisionMilestone1Dot5 &&
        !isMobileResolution &&
        isNewTicketPage
    )
}
