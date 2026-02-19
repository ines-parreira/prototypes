import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { useParams } from 'react-router-dom'

export function useHelpdeskV2MS3Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const hasUIVisionMilestone3 = useFlag(FeatureFlagKey.UIVisionMilestone3)
    const isMobileResolution = useIsMobileResolution()

    const { ticketId } = useParams<{ ticketId: string }>()

    const isNotNewTicketPage = ticketId !== 'new'

    return (
        hasUIVisionBeta &&
        hasUIVisionMilestone3 &&
        !isMobileResolution &&
        isNotNewTicketPage
    )
}
