import type { Opportunity } from 'pages/aiAgent/opportunities/types'

import { getReferenceVisual } from '../../icons'
import {
    ReferenceCardRow,
    ReferenceCardShell,
} from '../shared/ReferenceCardShell'
import { getOpportunityTypeTag } from './status'

const VISUAL = getReferenceVisual('opportunity')

type Props = {
    opportunity: Opportunity
}

export function OpportunityReferenceCardView({ opportunity }: Props) {
    const resourceCount = opportunity.resources?.length ?? 0
    const ticketCount = opportunity.ticketCount ?? 0
    const title = opportunity.insight || 'Untitled opportunity'

    return (
        <ReferenceCardShell
            icon={VISUAL.icon}
            typeLabel={VISUAL.label}
            title={title}
            statusTag={getOpportunityTypeTag(opportunity.type)}
            rows={
                <>
                    {ticketCount > 0 ? (
                        <ReferenceCardRow icon="mail">
                            {ticketCount}{' '}
                            {ticketCount === 1
                                ? 'detected ticket'
                                : 'detected tickets'}
                        </ReferenceCardRow>
                    ) : null}
                    {resourceCount > 0 ? (
                        <ReferenceCardRow icon="nav-map">
                            {resourceCount}{' '}
                            {resourceCount === 1
                                ? 'related resource'
                                : 'related resources'}
                        </ReferenceCardRow>
                    ) : null}
                </>
            }
        />
    )
}
