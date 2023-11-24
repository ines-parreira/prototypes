import React, {useRef, useState} from 'react'

import {ReportIssueCaseReason} from 'models/selfServiceConfiguration/types'
import SortableAccordion from 'pages/common/components/accordion/SortableAccordion'
import SortableAccordionItem from 'pages/common/components/accordion/SortableAccordionItem'
import {
    DEFAULT_REASON_ACTIONS,
    REASONS_DROPDOWN_SECTIONS_WITH_OPTIONS,
} from 'models/selfServiceConfiguration/constants'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'

import ReportOrderIssueScenarioReason from './ReportOrderIssueScenarioReason'
import {useReportOrderIssueScenarioFormContext} from './ReportOrderIssueScenarioFormContext'

import css from './ReportOrderIssueScenarioReasons.less'

type Props = {
    items: ReportIssueCaseReason[]
    expandedItem: ReportIssueCaseReason['reasonKey'] | null
    onExpandedItemChange: (
        expandedItem: ReportIssueCaseReason['reasonKey'] | null
    ) => void
    onHoveredItemChange: (
        expandedItem: ReportIssueCaseReason['reasonKey'] | null
    ) => void
    onPreviewChange: (items: ReportIssueCaseReason[]) => void
    onChange: (items: ReportIssueCaseReason[]) => void
}

const ReportOrderIssueScenarioReasons = ({
    items,
    expandedItem,
    onExpandedItemChange,
    onHoveredItemChange,
    onPreviewChange,
    onChange,
}: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const {isUpdatePending, hasError, errors} =
        useReportOrderIssueScenarioFormContext()

    const hasReasonActionError = 'action' in errors
    const selectedReasons = items.map((item) => item.reasonKey)

    const handleReorder = (
        reorderedItemKeys: ReportIssueCaseReason['reasonKey'][]
    ) => {
        const itemsByKey = items.reduce<
            Record<ReportIssueCaseReason['reasonKey'], ReportIssueCaseReason>
        >((acc, item) => ({...acc, [item.reasonKey]: item}), {})

        const nextItems = reorderedItemKeys.map((id) => itemsByKey[id])

        onChange(nextItems)
    }
    const handleItemPreviewChange = (nextItem: ReportIssueCaseReason) => {
        const nextItems = [...items]
        const index = nextItems.findIndex(
            (item) => item.reasonKey === nextItem.reasonKey
        )

        if (index !== -1) {
            nextItems[index] = nextItem
            onPreviewChange(nextItems)
        }
    }
    const handleItemDelete = (
        reasonKey: ReportIssueCaseReason['reasonKey']
    ) => {
        const nextItems = [...items]
        const index = nextItems.findIndex(
            (item) => item.reasonKey === reasonKey
        )

        if (index !== -1) {
            nextItems.splice(index, 1)
            onPreviewChange(nextItems)
        }
    }
    const handleAddReason = (reasonKey: ReportIssueCaseReason['reasonKey']) => {
        if (!selectedReasons.includes(reasonKey)) {
            onPreviewChange([
                ...items,
                {
                    reasonKey,
                    action: DEFAULT_REASON_ACTIONS[reasonKey],
                },
            ])
        }
    }

    return (
        <>
            {items.length > 0 && (
                <SortableAccordion
                    onReorder={handleReorder}
                    expandedItem={expandedItem}
                    onChange={onExpandedItemChange}
                    onHoveredItemChange={onHoveredItemChange}
                    isDisabled={isUpdatePending || hasError}
                >
                    {items.map((item) => (
                        <SortableAccordionItem
                            key={item.reasonKey}
                            id={item.reasonKey}
                            isDisabled={hasReasonActionError}
                        >
                            <ReportOrderIssueScenarioReason
                                value={item}
                                onPreviewChange={handleItemPreviewChange}
                                onDelete={handleItemDelete}
                            />
                        </SortableAccordionItem>
                    ))}
                </SortableAccordion>
            )}
            <Button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                ref={buttonRef}
                intent="secondary"
                className={css.addReasonButton}
            >
                <ButtonIconLabel icon="arrow_drop_down" position="right">
                    Add Option
                </ButtonIconLabel>
            </Button>
            <Dropdown
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
                target={buttonRef}
                value={selectedReasons}
            >
                <DropdownSearch autoFocus />
                <DropdownBody>
                    {REASONS_DROPDOWN_SECTIONS_WITH_OPTIONS.map(
                        ([title, options]) => (
                            <DropdownSection key={title} title={title}>
                                {options.map((option) => (
                                    <DropdownItem
                                        key={option.value}
                                        option={option}
                                        onClick={handleAddReason}
                                        shouldCloseOnSelect
                                    />
                                ))}
                            </DropdownSection>
                        )
                    )}
                </DropdownBody>
            </Dropdown>
        </>
    )
}

export default ReportOrderIssueScenarioReasons
