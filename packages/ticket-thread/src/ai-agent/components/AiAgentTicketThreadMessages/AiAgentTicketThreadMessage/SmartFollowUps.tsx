import { useMemo } from 'react'

import cn from 'classnames'

import { Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { SmartFollowUp } from './useSmartFollowUps'

import css from './SmartFollowUps.less'

const SELECTED_SMART_FOLLOW_UP_TOOLTIP =
    'Customer selected a quick-reply given by the AI Agent'

type SmartFollowUpsProps = {
    selectedSmartFollowUpIndex?: number
    showAllSmartFollowUps?: boolean
    smartFollowUps: SmartFollowUp[]
}

export function SmartFollowUps({
    selectedSmartFollowUpIndex,
    showAllSmartFollowUps = false,
    smartFollowUps,
}: SmartFollowUpsProps) {
    const { otherSmartFollowUps, selectedSmartFollowUp } = useMemo(() => {
        const selectedSmartFollowUp =
            selectedSmartFollowUpIndex !== undefined
                ? smartFollowUps[selectedSmartFollowUpIndex]
                : null

        const otherSmartFollowUps = showAllSmartFollowUps
            ? smartFollowUps.filter(
                  (_, index) => index !== selectedSmartFollowUpIndex,
              )
            : []

        return {
            otherSmartFollowUps,
            selectedSmartFollowUp,
        }
    }, [selectedSmartFollowUpIndex, showAllSmartFollowUps, smartFollowUps])

    if (!selectedSmartFollowUp && otherSmartFollowUps.length === 0) {
        return null
    }

    return (
        <div
            className={cn(css.smartFollowUps, {
                [css.topSpacing]: !selectedSmartFollowUp,
            })}
        >
            {selectedSmartFollowUp && (
                <Tooltip
                    placement="right"
                    trigger={
                        <span
                            className={cn(css.pill, css.selectedTooltipTrigger)}
                        >
                            <Icon
                                name="check"
                                size="sm"
                                color="content-neutral-secondary"
                            />
                            <Text
                                as="span"
                                size="sm"
                                color="content-neutral-secondary"
                            >
                                {selectedSmartFollowUp.text}
                            </Text>
                        </span>
                    }
                >
                    <TooltipContent title={SELECTED_SMART_FOLLOW_UP_TOOLTIP} />
                </Tooltip>
            )}
            {otherSmartFollowUps.map((followUp, index) => (
                <span key={`${followUp.text}-${index}`} className={css.pill}>
                    <Text as="span" size="sm" color="content-neutral-secondary">
                        {followUp.text}
                    </Text>
                </span>
            ))}
        </div>
    )
}
