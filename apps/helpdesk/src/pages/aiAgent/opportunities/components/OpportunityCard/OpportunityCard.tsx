import { useCallback, useState } from 'react'

import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { OpportunityType } from '../../enums'

import css from './OpportunityCard.less'

interface OpportunityCardProps {
    title: string
    type?: OpportunityType
    ticketCount?: number
    selected?: boolean
    onSelect?: () => void
}

export const OpportunityCard = ({
    title,
    type = OpportunityType.FILL_KNOWLEDGE_GAP,
    selected = false,
    ticketCount,
    onSelect,
}: OpportunityCardProps) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isTextOverflowing, setIsTextOverflowing] = useState(false)
    const [titleRef, setTitleRef] = useState<HTMLSpanElement | null>(null)
    const [ticketCountRef, setTicketCountRef] =
        useState<HTMLSpanElement | null>(null)

    const titleCallbackRef = useCallback((node: HTMLSpanElement | null) => {
        if (node) {
            setTitleRef(node)
            setIsTextOverflowing(node.scrollWidth > node.offsetWidth)
        }
    }, [])

    const getInfoContent = () => {
        switch (type) {
            case OpportunityType.RESOLVE_CONFLICT:
                return {
                    icon: 'error_outline',
                    text: 'Resolve conflict',
                }
            case OpportunityType.FILL_KNOWLEDGE_GAP:
            default:
                return {
                    icon: 'map',
                    text: 'Fill knowledge gap',
                }
        }
    }

    const infoContent = getInfoContent()

    return (
        <div
            className={classNames(css.card, {
                [css.cardHovered]: isHovered,
                [css.cardSelected]: selected,
                [css.cardSelectedHovered]: selected && isHovered,
            })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onSelect}
        >
            <div className={css.iconSection}>
                <i className={classNames('material-icons', css.infoIcon)}>
                    {infoContent.icon}
                </i>
            </div>
            <div className={css.infoSection}>
                <div className={css.header}>
                    <span className={css.infoText}>{infoContent.text}</span>
                    {ticketCount !== undefined && (
                        <span
                            ref={setTicketCountRef}
                            className={css.ticketCount}
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
                    )}
                </div>
                <span ref={titleCallbackRef} className={css.title}>
                    {title}
                </span>
            </div>
            {isTextOverflowing && titleRef && (
                <Tooltip placement="top" target={titleRef}>
                    {title}
                </Tooltip>
            )}
            {ticketCount !== undefined && ticketCountRef && (
                <Tooltip placement="top" target={ticketCountRef}>
                    {ticketCount} related{' '}
                    {ticketCount > 1 ? 'tickets' : 'ticket'}
                </Tooltip>
            )}
        </div>
    )
}
