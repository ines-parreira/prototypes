import { useMemo, useRef } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import { OpportunityType } from '../../enums'

import css from './OpportunityDetailsCard.less'

interface OpportunityDetailsCardProps {
    type: OpportunityType
    title: string
    description?: string
    ticketCount?: number
    onTicketCountClick?: () => void
}

export const OpportunityDetailsCard = ({
    type,
    description,
    ticketCount,
    onTicketCountClick,
}: OpportunityDetailsCardProps) => {
    const ticketCountRef = useRef<HTMLSpanElement>(null)

    const { defaultDescription } = useMemo(() => {
        switch (type) {
            case OpportunityType.RESOLVE_CONFLICT:
                return {
                    defaultDescription:
                        "Review and approve this AI-generated Guidance based on your customers' top asked questions to improve AI Agent's performance.",
                }
            case OpportunityType.FILL_KNOWLEDGE_GAP:
            default:
                return {
                    defaultDescription:
                        "Review and approve this AI-generated Guidance based on your customers' top asked questions to improve AI Agent's performance. Note: you may already have an existing Guidance addressing this topic.",
                }
        }
    }, [type])

    return (
        <div className={css.contentContainer}>
            <div className={css.header}>
                <h3 className={css.title}>Opportunity</h3>
                {ticketCount !== undefined && onTicketCountClick && (
                    <>
                        <span
                            ref={ticketCountRef}
                            className={css.ticketCount}
                            onClick={(e) => {
                                e.stopPropagation()
                                onTicketCountClick()
                            }}
                        >
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.ticketCountIcon,
                                )}
                            >
                                forum
                            </i>
                            {ticketCount}
                        </span>
                        {ticketCountRef.current && (
                            <Tooltip
                                placement="top"
                                target={ticketCountRef.current}
                                trigger={['hover']}
                                delay={{ show: 0, hide: 300 }}
                            >
                                View related tickets
                            </Tooltip>
                        )}
                    </>
                )}
            </div>
            <p className={css.description}>
                {description || defaultDescription}
            </p>
        </div>
    )
}
