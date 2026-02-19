import { useCallback, useMemo, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import cn from 'classnames'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import type { TicketQAScoreDimension } from '@gorgias/helpdesk-queries'

import { dimensionOrderOfManualDimensions } from 'auto_qa/config'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import TextArea from 'pages/common/forms/TextArea'

import type { DimensionConfig } from '../types'
import DimensionUser from './DimensionUser'

import css from './Dimension.less'

type Props = {
    config: DimensionConfig
    dimension: TicketQAScoreDimension
    onChange: (prediction: number, explanation: string) => void
    ticketId: number
}

export default function Dimension({
    config,
    dimension,
    onChange,
    ticketId,
}: Props) {
    const [isExpanded, setIsExpanded] = useState(
        () =>
            config.autoExpandThreshold !== undefined &&
            dimension.prediction <= config.autoExpandThreshold,
    )
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const floatingRef = useRef<HTMLDivElement>(null)
    const selectRef = useRef<HTMLDivElement>(null)
    const hasUIVisionMS1 = useHelpdeskV2MS1Flag()

    const predictionLabel = useMemo(
        () =>
            config.options.find((opt) => opt.value === dimension.prediction)
                ?.label || undefined,
        [config.options, dimension.prediction],
    )

    const handleSelectBoxClick = useCallback(
        (v: boolean) => {
            setIsSelectOpen(v)
            if (v) {
                logEvent(SegmentEvent.AutoQATicketInteraction, {
                    ticket_id: ticketId,
                    type: `${dimension.name}_score_clicked`,
                })
            }
        },
        [dimension.name, ticketId],
    )

    const handleClickExpand = useCallback(() => {
        const isExpandedStateCB = (e: boolean) => {
            const nextExpandedState = !e
            if (nextExpandedState) {
                logEvent(SegmentEvent.AutoQATicketInteraction, {
                    ticket_id: ticketId,
                    type: `${dimension.name}_toggle_clicked`,
                })
            }
            return nextExpandedState
        }
        setIsExpanded(isExpandedStateCB)
    }, [dimension.name, ticketId])

    const handleClickPrediction = useCallback(
        (value: number) => {
            onChange(value, dimension.explanation)
        },
        [dimension.explanation, onChange],
    )

    const handleChangeExplanation = useCallback(
        (value: string) => {
            onChange(dimension.prediction, value)
        },
        [dimension.prediction, onChange],
    )

    const scoreHasBeenSelected =
        dimension.prediction !== null && dimension.prediction !== undefined

    const isManualDimension = dimensionOrderOfManualDimensions.includes(
        dimension.name,
    )
    const dimensionFooter = isManualDimension ? (
        <></>
    ) : (
        <>
            <i className={cn('material-icons', css.aiIcon)}>auto_awesome</i>
            AI generated, edit to improve AI model
        </>
    )
    const explanationTextAreaRef = useRef<HTMLDivElement>(null)

    return (
        <>
            <div
                className={cn(css.container, {
                    [css.hasUIVisionMS1]: hasUIVisionMS1,
                })}
            >
                <div className={css.label}>
                    <Button
                        className={css.button}
                        fillStyle="ghost"
                        intent="secondary"
                        area-label={`expand_${dimension.name}`}
                        aria-expanded={isExpanded}
                        onClick={handleClickExpand}
                    >
                        <ButtonIconLabel
                            iconClassName={cn(
                                'material-icons-round',
                                css.arrowIcon,
                            )}
                            icon={
                                isExpanded ? 'arrow_drop_down' : 'arrow_right'
                            }
                        >
                            {config.label}
                        </ButtonIconLabel>
                    </Button>
                    <i
                        id={dimension.name}
                        className={cn('material-icons-outlined', css.icon)}
                    >
                        info
                    </i>
                    <Tooltip target={dimension.name} placement="top-end">
                        {config.tooltip}
                    </Tooltip>
                </div>

                <SelectInputBox
                    className={css.prediction}
                    placeholder={config.scorePlaceholder}
                    onToggle={handleSelectBoxClick}
                    floating={floatingRef}
                    ref={selectRef}
                    label={predictionLabel}
                    prefix={config.prefix}
                >
                    <SelectInputBoxContext.Consumer>
                        {(context) => (
                            <Dropdown
                                isOpen={isSelectOpen}
                                onToggle={() => context!.onBlur()}
                                ref={floatingRef}
                                target={selectRef}
                                value={dimension.prediction}
                            >
                                <DropdownBody>
                                    {config.options.map((opt) => (
                                        <DropdownItem
                                            key={opt.value}
                                            option={opt}
                                            onClick={handleClickPrediction}
                                            shouldCloseOnSelect
                                        />
                                    ))}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>
            </div>
            {isExpanded && (
                <div
                    className={cn(css.explanation, {
                        [css.hasUIVisionMS1]: hasUIVisionMS1,
                    })}
                >
                    <div ref={explanationTextAreaRef}>
                        <TextArea
                            autoRowHeight={true}
                            placeholder={config.placeholder}
                            value={dimension.explanation}
                            onChange={handleChangeExplanation}
                            isDisabled={!scoreHasBeenSelected}
                        />
                    </div>
                    {!scoreHasBeenSelected && (
                        <Tooltip
                            target={explanationTextAreaRef}
                            placement="top"
                        >
                            Please select a score before adding a comment
                        </Tooltip>
                    )}
                    <div className={css.lastUpdateActor}>
                        {dimension.user_id ? (
                            <DimensionUser userId={dimension.user_id} />
                        ) : (
                            dimensionFooter
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
