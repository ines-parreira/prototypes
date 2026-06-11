import { useRef, useState } from 'react'

import { Box, Button } from '@gorgias/axiom'

import {
    DEFAULT_REASON_ACTIONS,
    REASONS_DROPDOWN_SECTIONS_WITH_OPTIONS,
} from 'models/selfServiceConfiguration/constants'
import type { ReportIssueCaseReason } from 'models/selfServiceConfiguration/types'
import { SortableAccordion } from 'pages/common/components/accordion/SortableAccordion'
import { SortableAccordionItem } from 'pages/common/components/accordion/SortableAccordionItem'
import { Dropdown } from 'pages/common/components/dropdown/Dropdown'
import { DefaultExportDropdownBody as DropdownBody } from 'pages/common/components/dropdown/DropdownBody'
import { DefaultExportDropdownItem as DropdownItem } from 'pages/common/components/dropdown/DropdownItem'
import { DefaultExportDropdownSearch as DropdownSearch } from 'pages/common/components/dropdown/DropdownSearch'
import { DefaultExportDropdownSection as DropdownSection } from 'pages/common/components/dropdown/DropdownSection'

import { usePropagateError } from '../ScenarioFormContext'
import { ScenarioReasonItem } from './ScenarioReasonItem'

type Props = {
    value: ReportIssueCaseReason[]
    onChange: (nextValue: ReportIssueCaseReason[]) => void
    onExpandedReasonChange?: (reasonKey: string | null) => void
}

export const ScenarioReasonEditor = ({
    value,
    onChange,
    onExpandedReasonChange,
}: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [expandedReasonKey, setExpandedReasonKey] = useState<string | null>(
        null,
    )
    const buttonContainerRef = useRef<HTMLDivElement>(null)

    const handleExpandedChange = (nextKey: string | null) => {
        setExpandedReasonKey(nextKey)
        onExpandedReasonChange?.(nextKey)
    }

    const hasError = !value.length
    usePropagateError('reasons', hasError)

    const selectedReasonKeys = value.map((item) => item.reasonKey)

    const handleReorder = (reorderedKeys: string[]) => {
        const byKey = value.reduce<Record<string, ReportIssueCaseReason>>(
            (acc, item) => ({ ...acc, [item.reasonKey]: item }),
            {},
        )
        onChange(reorderedKeys.map((key) => byKey[key]))
    }

    const handleItemChange = (nextItem: ReportIssueCaseReason) => {
        const nextItems = [...value]
        const index = nextItems.findIndex(
            (item) => item.reasonKey === nextItem.reasonKey,
        )
        if (index !== -1) {
            nextItems[index] = nextItem
            onChange(nextItems)
        }
    }

    const handleItemDelete = (reasonKey: string) => {
        onChange(value.filter((item) => item.reasonKey !== reasonKey))
    }

    const handleAddReason = (reasonKey: string) => {
        if (!selectedReasonKeys.includes(reasonKey)) {
            onChange([
                ...value,
                {
                    reasonKey,
                    action: DEFAULT_REASON_ACTIONS[reasonKey],
                },
            ])
        }
    }

    return (
        <Box flexDirection="column" gap="sm">
            {value.length > 0 && (
                <SortableAccordion
                    onReorder={handleReorder}
                    expandedItem={expandedReasonKey}
                    onChange={handleExpandedChange}
                >
                    {value.map((item) => (
                        <SortableAccordionItem
                            key={item.reasonKey}
                            id={item.reasonKey}
                        >
                            <ScenarioReasonItem
                                value={item}
                                onChange={handleItemChange}
                                onDelete={handleItemDelete}
                            />
                        </SortableAccordionItem>
                    ))}
                </SortableAccordion>
            )}
            <Box>
                <div ref={buttonContainerRef}>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                    >
                        Add Option
                    </Button>
                </div>
                <Dropdown
                    isOpen={isDropdownOpen}
                    onToggle={setIsDropdownOpen}
                    target={buttonContainerRef}
                    value={selectedReasonKeys}
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
                            ),
                        )}
                    </DropdownBody>
                </Dropdown>
            </Box>
        </Box>
    )
}
