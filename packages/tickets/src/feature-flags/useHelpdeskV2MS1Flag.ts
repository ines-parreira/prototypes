import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { useParams } from 'react-router-dom'

export function useHelpdeskV2MS1Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const hasUIVisionMilestone1 = useFlag(FeatureFlagKey.UIVisionMilestone1)
    const isMobileResolution = useIsMobileResolution()

    const { ticketId } = useParams<{ ticketId: string }>()

    const isNotNewTicketPage = ticketId !== 'new'

    return (
        hasUIVisionBeta &&
        hasUIVisionMilestone1 &&
        !isMobileResolution &&
        isNotNewTicketPage
    )
}
