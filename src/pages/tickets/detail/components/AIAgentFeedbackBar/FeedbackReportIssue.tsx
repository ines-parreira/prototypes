import React, {useCallback, useRef, useState} from 'react'
import {Label} from '@gorgias/ui-kit'

import Tag from 'pages/common/components/Tag/Tag'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import {
    ReportIssueLabels,
    ReportIssueOption,
} from 'models/aiAgentFeedback/constants'

import {logEventWithSampling} from 'common/segment/segment'
import {SegmentEvent} from 'common/segment'
import css from './FeedbackReportIssue.less'

const closeIcon = (
    <i data-testid="report-issue-tag-close-icon" className="material-icons">
        close
    </i>
)

const reportIssueOptions = Object.entries(ReportIssueLabels).map(
    ([value, label]) => ({
        value,
        label,
    })
) as {value: ReportIssueOption; label: string}[]

type Props = {
    value: ReportIssueOption[]
    onChange: (value: ReportIssueOption[]) => void
    onClose?: () => void
    onRemove?: (value: ReportIssueOption[]) => void
    accountId: number
}

const ReportIssueSelect: React.FC<Props> = ({
    value,
    onChange,
    onClose,
    onRemove,
    accountId,
}) => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const selectInputBoxRef = useRef<HTMLDivElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const onItemClick = (item: ReportIssueOption) => {
        onChange(
            value.includes(item)
                ? value.filter((v) => v !== item)
                : [...value, item]
        )
        logEventWithSampling(
            SegmentEvent.AiAgentFeedbackReportIssueSelectAddOption,
            {
                accountId,
                value: item,
            }
        )
    }

    const onRemoveItem = (item: ReportIssueOption) => {
        onRemove?.([item])
        onChange(value.filter((v) => v !== item))
        logEventWithSampling(
            SegmentEvent.AiAgentFeedbackReportIssueSelectRemoveOption,
            {
                accountId,
                value: item,
            }
        )
    }

    const onToggle = useCallback(
        (toggleValue) => {
            if (isOpen && !toggleValue) {
                onClose?.()
            }
            setIsOpen(toggleValue)

            if (toggleValue) {
                logEventWithSampling(
                    SegmentEvent.AiAgentFeedbackReportIssueSelectClicked,
                    {
                        accountId,
                    }
                )
            }
        },
        [onClose, isOpen, accountId]
    )

    return (
        <div className={css.container}>
            <Label>Report another issue</Label>
            <SelectInputBox
                placeholder="Select issues"
                onToggle={onToggle}
                floating={floatingRef}
                ref={selectInputBoxRef}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isMultiple
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={selectInputBoxRef}
                            value={value}
                            className={css.dropdown}
                        >
                            {reportIssueOptions.map((option) => (
                                <DropdownItem
                                    data-testid="dropdown-item"
                                    key={option.value}
                                    option={option}
                                    onClick={onItemClick}
                                />
                            ))}
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            <div className={css.tags}>
                {reportIssueOptions.map((option) => {
                    const isSelected = value.includes(option.value)

                    if (!isSelected) {
                        return null
                    }

                    return (
                        <Tag
                            key={option.value}
                            text={option.label}
                            trailIcon={closeIcon}
                            onTrailIconClick={() => onRemoveItem(option.value)}
                            data-testid="tag"
                        />
                    )
                })}
            </div>
        </div>
    )
}

export default ReportIssueSelect
