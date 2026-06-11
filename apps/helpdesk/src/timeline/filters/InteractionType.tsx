import { useRef, useState } from 'react'

import { Dropdown } from 'pages/common/components/dropdown/Dropdown'
import { DefaultExportDropdownBody as DropdownBody } from 'pages/common/components/dropdown/DropdownBody'
import { DefaultExportDropdownItem as DropdownItem } from 'pages/common/components/dropdown/DropdownItem'
import { FilterName } from 'pages/common/forms/FilterInput/FilterName'
import { DefaultExportFilterValue as FilterValue } from 'pages/common/forms/FilterInput/FilterValue'

import { INTERACTION_FILTER_OPTIONS } from '../constants'
import type { InteractionFilterType } from '../types'
import { getTypeOptionLabels } from './helpers/interactionFilter'

import css from './Filters.less'

type Props = {
    selectedType: InteractionFilterType[]
    toggleSelectedType: (newType: InteractionFilterType) => void
}

export function InteractionType({ selectedType, toggleSelectedType }: Props) {
    const ref = useRef<HTMLDivElement>(null)
    const [isInteractionTypeOpen, setInteractionTypeOpen] = useState(false)

    return (
        <div className={css.customerTimelineFilter}>
            <FilterName name="interaction type" />
            <FilterValue
                ref={ref}
                optionsLabels={getTypeOptionLabels(selectedType)}
                onClick={() => {
                    setInteractionTypeOpen(true)
                }}
                placeholder="All"
            />
            <Dropdown
                isMultiple
                isOpen={isInteractionTypeOpen}
                onToggle={setInteractionTypeOpen}
                target={ref}
                value={selectedType}
            >
                <DropdownBody>
                    <ul className={css.customerTimelineStatusList}>
                        {INTERACTION_FILTER_OPTIONS.map((option) => (
                            <DropdownItem
                                key={option.value}
                                option={option}
                                onClick={toggleSelectedType}
                            />
                        ))}
                    </ul>
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
