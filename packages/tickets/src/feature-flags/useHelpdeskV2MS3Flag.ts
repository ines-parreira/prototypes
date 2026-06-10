import { useHelpdeskV2BaselineFlag } from '@repo/feature-flags'
import { useLocation, useParams } from 'react-router-dom'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

export function useHelpdeskV2MS3Flag() {
    const { hasUIVisionBeta } = useHelpdeskV2BaselineFlag()
    const isMobileResolution = useIsMobileResolution()

    const { ticketId } = useParams<{ ticketId: string }>()
    const { pathname } = useLocation()

    const isNotNewTicketPage = ticketId !== 'new'
    const isPrintTicketPage = /^\/app\/ticket\/[^/]+\/print$/.test(pathname)

    return (
        hasUIVisionBeta &&
        !isMobileResolution &&
        isNotNewTicketPage &&
        !isPrintTicketPage
    )
}
