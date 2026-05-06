import { useHelpdeskV2BaselineFlag } from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { useLocation } from 'react-router-dom'

export function useHelpdeskV2MS1Dot5Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()

    const isMobileResolution = useIsMobileResolution()
    const { pathname } = useLocation()

    const isNewTicketPage = pathname.includes('/app/ticket/new')

    return hasUIVisionBeta && !isMobileResolution && isNewTicketPage
}
