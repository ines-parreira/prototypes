import {TicketQAScoreDimension} from '@gorgias/api-queries'
import cn from 'classnames'
import React, {useCallback, useMemo, useRef, useState} from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import TextArea from 'pages/common/forms/TextArea'

import type {DimensionConfig} from '../types'
import DimensionUser from './DimensionUser'

import css from './Dimension.less'

type Props = {
    config: DimensionConfig
    dimension: TicketQAScoreDimension
    onChange: (prediction: number, explanation: string) => void
}

export default function Dimension({config, dimension, onChange}: Props) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const floatingRef = useRef<HTMLDivElement>(null)
    const selectRef = useRef<HTMLDivElement>(null)

    const predictionLabel = useMemo(
        () =>
            config.options.find((opt) => opt.value === dimension.prediction)
                ?.label || undefined,
        [config.options, dimension.prediction]
    )

    const handleClickExpand = useCallback(() => {
        setIsExpanded((e) => !e)
    }, [])

    const handleClickPrediction = useCallback(
        (value) => {
            onChange(value, dimension.explanation)
        },
        [dimension.explanation, onChange]
    )

    const handleChangeExplanation = useCallback(
        (value: string) => {
            onChange(dimension.prediction, value)
        },
        [dimension.prediction, onChange]
    )

    return (
        <>
            <div className={css.container}>
                <IconButton
                    className={css.arrowButton}
                    fillStyle="ghost"
                    iconClassName={cn('material-icons-round', css.arrowIcon)}
                    intent="secondary"
                    size="small"
                    onClick={handleClickExpand}
                >
                    {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                </IconButton>
                <label className={css.label}>{config.label}</label>

                <SelectInputBox
                    className={css.prediction}
                    placeholder="Select issues"
                    onToggle={setIsSelectOpen}
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
                <div className={css.explanation}>
                    <TextArea
                        autoRowHeight={true}
                        placeholder="Provide feedback"
                        value={dimension.explanation}
                        onChange={handleChangeExplanation}
                    />
                    <div className={css.lastUpdateActor}>
                        {dimension.user_id ? (
                            <DimensionUser userId={dimension.user_id} />
                        ) : (
                            <>
                                <i className={cn('material-icons', css.aiIcon)}>
                                    auto_awesome
                                </i>{' '}
                                AI generated, edit to improve AI model
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
