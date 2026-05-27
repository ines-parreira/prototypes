import type { ReactNode } from 'react'

import { Link } from 'react-router-dom'

import type { GorgiasCopilotReference } from '@gorgias/copilot'

import { GuidanceReferenceCard } from './cards/guidance/GuidanceReferenceCard'
import { OpportunityReferenceCard } from './cards/opportunity/OpportunityReferenceCard'
import { SkillReferenceCard } from './cards/skill/SkillReferenceCard'
import { SupportActionReferenceCard } from './cards/supportAction/SupportActionReferenceCard'
import { TicketReferenceCard } from './cards/ticket/TicketReferenceCard'
import { ReferencePopover } from './ReferencePopover'
import { resolveReferenceRoute } from './routes'

type Props = {
    reference: GorgiasCopilotReference
    children: ReactNode
}

export function ReferenceLink({ reference, children }: Props) {
    const to = resolveReferenceRoute(reference)
    if (!to) return null

    const card = getCardForReference(reference)
    const trigger = <Link to={to}>{children}</Link>

    if (!card) {
        return trigger
    }

    return (
        <ReferencePopover trigger={trigger}>
            {({ isOpen }) => card(isOpen)}
        </ReferencePopover>
    )
}

function getCardForReference(
    reference: GorgiasCopilotReference,
): ((isOpen: boolean) => ReactNode) | null {
    switch (reference.type) {
        case 'guidance':
            return (isOpen) => (
                <GuidanceReferenceCard
                    articleId={reference.id}
                    shopName={reference.shopName}
                    shopType={reference.shopType}
                    isOpen={isOpen}
                />
            )
        case 'skill':
            return (isOpen) => (
                <SkillReferenceCard
                    articleId={reference.id}
                    shopName={reference.shopName}
                    isOpen={isOpen}
                />
            )
        case 'ticket':
            return (isOpen) => (
                <TicketReferenceCard ticketId={reference.id} isOpen={isOpen} />
            )
        case 'opportunity':
            return (isOpen) => (
                <OpportunityReferenceCard
                    opportunityId={reference.id}
                    shopName={reference.shopName}
                    isOpen={isOpen}
                />
            )
        case 'support-action':
            return (isOpen) => (
                <SupportActionReferenceCard
                    workflowId={reference.id}
                    isOpen={isOpen}
                />
            )
        default:
            return null
    }
}
