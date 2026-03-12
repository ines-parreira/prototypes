import { useCallback, useState } from 'react'

import classNames from 'classnames'

import { Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { OpportunityType } from '../../enums'

import css from './OpportunityCard.less'

interface OpportunityCardProps {
    title: string
    type?: OpportunityType
    ticketCount?: number
    selected?: boolean
    onSelect?: () => void
    isRestricted?: boolean
}

export const OpportunityCard = ({
    title,
    type = OpportunityType.FILL_KNOWLEDGE_GAP,
    selected = false,
    ticketCount,
    onSelect,
    isRestricted = false,
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

        if (isRestricted || !isTextOverflowing) {
            return titleElement
        }

        return (
            <Tooltip placement="top" trigger={titleElement}>
                <TooltipContent caption={title} />
            </Tooltip>
        )
    }

    const infoContent = getInfoContent()

    return (
        <div
            className={classNames(css.card, {
                [css.cardHovered]: isHovered && !isRestricted,
                [css.cardSelected]: selected && !isRestricted,
                [css.cardSelectedHovered]:
                    selected && isHovered && !isRestricted,
                [css.cardRestricted]: isRestricted,
            })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={isRestricted ? undefined : onSelect}
            aria-disabled={isRestricted}
        >
            <div className={css.header}>
                {isRestricted ? (
                    <Tooltip
                        placement="top"
                        isOpen={isHovered}
                        trigger={
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
                        }
                    >
                        <TooltipContent>
                            Upgrade to access all
                            <br />
                            opportunities for AI Agent
                        </TooltipContent>
                    </Tooltip>
                ) : (
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
                )}
                {ticketCount !== undefined &&
                    (isRestricted ? (
                        <span
                            className={classNames(
                                css.ticketCount,
                                css.ticketCountDisabled,
                            )}
                        >
                            <Icon
                                name="comm-chat-conversation"
                                size="sm"
                                color="var(--content-neutral-secondary)"
                            />
                            <Text size="xs" variant="bold">
                                {ticketCount}
                            </Text>
                        </span>
                    ) : (
                        <Tooltip
                            placement="top"
                            trigger={
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
                            }
                        >
                            <TooltipContent
                                title={`${ticketCount} related ${ticketCount > 1 ? 'tickets' : 'ticket'}`}
                            />
                        </Tooltip>
                    ))}
            </div>

            <OpportunityTitle />
        </div>
    )
}
