import { Text } from '@gorgias/axiom'

import { OpportunityType } from '../../enums'

import css from './OpportunityDetailsCard.less'

interface OpportunityDetailsCardProps {
    type: OpportunityType
    ticketCount?: number
    onTicketCountClick?: () => void
}

interface BannerProps {
    ticketCount?: number
    handleTicketCountClick: (e: React.MouseEvent) => void
}

const BannerForResolveConflict = ({
    ticketCount,
    handleTicketCountClick,
}: BannerProps) => {
    return (
        <div>
            <Text size="md">
                Edit, disable or delete the conflicting knowledge below. This
                conflict has affected{' '}
                <span
                    // oxlint-disable-next-line prefer-tag-over-role
                    role="button"
                    tabIndex={0}
                    className={css.handoverTickets}
                    onClick={handleTicketCountClick}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleTicketCountClick(
                                e as unknown as React.MouseEvent,
                            )
                        }
                    }}
                >
                    {ticketCount} {ticketCount === 1 ? 'ticket' : 'tickets'}.
                </span>{' '}
            </Text>
        </div>
    )
}

const BannerForKnowledgeGap = ({
    ticketCount,
    handleTicketCountClick,
}: BannerProps) => {
    if (!ticketCount) {
        return (
            <Text size="md">
                Resolve this AI-generated guidance based on your customers&apos;
                top asked questions to improve AI Agent&apos;s performance.
                Note: you may already have an existing Guidance addressing this
                topic.
            </Text>
        )
    }

    return (
        <Text size="md">
            This knowledge gap was generated based on{' '}
            <span
                // oxlint-disable-next-line prefer-tag-over-role
                role="button"
                tabIndex={0}
                className={css.handoverTickets}
                onClick={handleTicketCountClick}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleTicketCountClick(e as unknown as React.MouseEvent)
                    }
                }}
            >
                {ticketCount} handover{' '}
                {ticketCount === 1 ? 'ticket' : 'tickets'}
            </span>{' '}
            AI Agent could not resolve. Create or update guidance to close this
            gap.
        </Text>
    )
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

    return type === OpportunityType.RESOLVE_CONFLICT ? (
        <BannerForResolveConflict
            ticketCount={ticketCount}
            handleTicketCountClick={handleTicketCountClick}
        />
    ) : (
        <BannerForKnowledgeGap
            ticketCount={ticketCount}
            handleTicketCountClick={handleTicketCountClick}
        />
    )
}
