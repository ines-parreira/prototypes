import { useCallback, useState } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import { OpportunityType } from '../../enums'

import css from './OpportunityCard.less'

interface OpportunityCardProps {
    title: string
    type?: OpportunityType
    selected?: boolean
    onSelect?: () => void
}

export const OpportunityCard = ({
    title,
    type = OpportunityType.FILL_KNOWLEDGE_GAP,
    selected = false,
    onSelect,
}: OpportunityCardProps) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isTextOverflowing, setIsTextOverflowing] = useState(false)
    const [titleRef, setTitleRef] = useState<HTMLSpanElement | null>(null)

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
            <div className={css.infoSection}>
                <i className={classNames('material-icons', css.infoIcon)}>
                    {infoContent.icon}
                </i>
                <span className={css.infoText}>{infoContent.text}</span>
            </div>
            <div className={css.header}>
                <span ref={titleCallbackRef} className={css.title}>
                    {title}
                </span>
            </div>
            {isTextOverflowing && titleRef && (
                <Tooltip placement="top" target={titleRef}>
                    {title}
                </Tooltip>
            )}
        </div>
    )
}
