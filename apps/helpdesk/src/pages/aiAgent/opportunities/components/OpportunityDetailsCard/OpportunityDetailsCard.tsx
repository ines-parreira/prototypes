import { Text } from '@gorgias/axiom'

import { OpportunityType } from '../../enums'

import css from './OpportunityDetailsCard.less'

interface OpportunityDetailsCardProps {
    type: OpportunityType
    ticketCount?: number
    onTicketCountClick?: () => void
}

export const OpportunityDetailsCard = ({
    type,
    ticketCount,
    onTicketCountClick,
}: OpportunityDetailsCardProps) => {
    const handleTicketCountClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onTicketCountClick?.()
    }

    const BannerForResolveConflict = () => {
        return (
            <div>
                <Text size="md">
                    Edit, disable or delete the conflicting knowledge below.
                    This conflict has affected{' '}
                    <span
                        className={css.handoverTickets}
                        onClick={handleTicketCountClick}
                    >
                        {ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}
                        .
                    </span>{' '}
                </Text>
            </div>
        )
    }

    const BannerForKnowledgeGap = () => {
        if (!ticketCount) {
            return (
                <div className={css.banner}>
                    <Text size="md">
                        Review and approve this AI-generated guidance based on
                        your customers&apos; top asked questions to improve AI
                        Agent&apos;s performance. Note: you may already have an
                        existing Guidance addressing this topic.
                    </Text>
                </div>
            )
        }

        return (
            <div className={css.banner}>
                <Text size="md">
                    This guidance was generated based on{' '}
                    <span
                        className={css.handoverTickets}
                        onClick={handleTicketCountClick}
                    >
                        {ticketCount} handover{' '}
                        {ticketCount === 1 ? 'ticket' : 'tickets'}
                    </span>{' '}
                    AI Agent could not resolve
                </Text>
            </div>
        )
    }

    return type === OpportunityType.RESOLVE_CONFLICT ? (
        <BannerForResolveConflict />
    ) : (
        <BannerForKnowledgeGap />
    )
}
