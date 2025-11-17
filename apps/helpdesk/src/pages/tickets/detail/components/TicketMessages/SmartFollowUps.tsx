import React, { useMemo } from 'react'

import { useId } from '@repo/hooks'
import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import type { SmartFollowUp } from 'models/ticket/types'
import { Pill } from 'pages/settings/conditionalFields/components/ExpressionField/Pill'
import { getShouldDisplayAllFollowUps } from 'state/ticket/selectors'

import css from './SmartFollowUps.less'

type Props = {
    smartFollowUps: SmartFollowUp[]
    selectedSmartFollowUpIndex?: number
}

export default function SmartFollowUps({
    smartFollowUps,
    selectedSmartFollowUpIndex,
}: Props) {
    const id = useId()
    const tooltipId = `selected-smart-follow-up-${id}`

    const shouldDisplayAllFollowUps = useAppSelector(
        getShouldDisplayAllFollowUps,
    )

    const { selectedSmartFollowUp, otherSmartFollowUps } = useMemo(() => {
        const selectedSmartFollowUp =
            selectedSmartFollowUpIndex !== undefined
                ? smartFollowUps[selectedSmartFollowUpIndex]
                : null

        const otherSmartFollowUps = shouldDisplayAllFollowUps
            ? smartFollowUps.filter(
                  (_, index) => index !== selectedSmartFollowUpIndex,
              )
            : []

        return {
            selectedSmartFollowUp,
            otherSmartFollowUps,
        }
    }, [smartFollowUps, selectedSmartFollowUpIndex, shouldDisplayAllFollowUps])

    if (!selectedSmartFollowUp && otherSmartFollowUps.length === 0) {
        return null
    }

    return (
        <div
            className={classNames(css.pills, {
                [css.topSpacing]: !selectedSmartFollowUp,
            })}
        >
            {selectedSmartFollowUp && (
                <>
                    <div id={tooltipId}>
                        <Pill color={'secondary'} className={css.pill}>
                            <i
                                className="material-icons"
                                style={{ fontSize: '16px', marginRight: '4px' }}
                            >
                                check
                            </i>
                            <span>{selectedSmartFollowUp.text}</span>
                        </Pill>
                    </div>
                    <Tooltip target={tooltipId} placement="right">
                        Customer selected a quick-reply given by the AI Agent
                    </Tooltip>
                </>
            )}
            {otherSmartFollowUps.map((followUp, index) => (
                <Pill
                    key={`${followUp.text}-${index}`}
                    color={'secondary'}
                    className={css.pill}
                >
                    <span>{followUp.text}</span>
                </Pill>
            ))}
        </div>
    )
}
