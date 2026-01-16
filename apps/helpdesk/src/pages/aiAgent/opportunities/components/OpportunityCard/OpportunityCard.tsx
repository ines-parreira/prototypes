import { useCallback, useState } from 'react'

import classNames from 'classnames'

import {
    Icon,
    type IconName,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

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

    const titleCallbackRef = useCallback((node: HTMLSpanElement | null) => {
        if (node) {
            setIsTextOverflowing(node.scrollWidth > node.offsetWidth)
        }
    }, [])

    const getInfoContent = () => {
        switch (type) {
            case OpportunityType.RESOLVE_CONFLICT:
                return {
                    icon: 'octagon-error',
                    text: 'Resolve conflict',
                }
            case OpportunityType.FILL_KNOWLEDGE_GAP:
            default:
                return {
                    icon: 'nav-map',
                    text: 'Fill knowledge gap',
                }
        }
    }

    const OpportunityTitle = () => {
        const titleElement = (
            <Text
                size="sm"
                variant="regular"
                className={css.title}
                ref={titleCallbackRef}
            >
                {title}
            </Text>
        )

        if (!isTextOverflowing) {
            return titleElement
        }

        return (
            <Tooltip placement="top">
                <TooltipTrigger>{titleElement}</TooltipTrigger>
                <TooltipContent title={title} />
            </Tooltip>
        )
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
            <div className={css.header}>
                <div className={css.infoSection}>
                    <Icon
                        name={infoContent.icon as IconName}
                        size="sm"
                        color="var(--content-neutral-secondary)"
                    />
                    <Text size="md" variant="bold">
                        {infoContent.text}
                    </Text>
                </div>
                {ticketCount !== undefined && (
                    <Tooltip placement="top">
                        <TooltipTrigger>
                            <span className={css.ticketCount}>
                                <Icon
                                    name="comm-chat-conversation"
                                    size="sm"
                                    color="var(--content-neutral-secondary)"
                                />
                                <Text size="xs" variant="bold">
                                    {ticketCount}
                                </Text>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent
                            title={`${ticketCount} related ${ticketCount > 1 ? 'tickets' : 'ticket'}`}
                        />
                    </Tooltip>
                )}
            </div>

            <OpportunityTitle />
        </div>
    )
}
