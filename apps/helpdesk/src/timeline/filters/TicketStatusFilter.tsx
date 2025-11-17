import { useRef, useState } from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import FilterName from 'pages/common/forms/FilterInput/FilterName'
import FilterValue from 'pages/common/forms/FilterInput/FilterValue'

import { STATUS_FILTERS } from '../constants'
import type { FilterKey } from '../types'
import { getOptionLabels } from './helpers/statusFilter'

import css from './Filters.less'

type Props = {
    selectedStatus: FilterKey[]
    toggleSelectedStatus: (newStatus: FilterKey) => void
    isDisabled: boolean
}

export function TicketStatusFilter({
    selectedStatus,
    toggleSelectedStatus,
    isDisabled,
}: Props) {
    const ref = useRef<HTMLDivElement>(null)
    const [isStatusFilterOpen, setStatusFilterOpen] = useState(false)

    return (
        <div className={css.customerTimelineFilter}>
            <FilterName name="ticket status" />
            <FilterValue
                ref={ref}
                optionsLabels={getOptionLabels(selectedStatus)}
                onClick={() => {
                    setStatusFilterOpen(true)
                }}
                placeholder="Select a status"
                isDisabled={isDisabled}
            />
            <Dropdown
                isMultiple
                isOpen={isStatusFilterOpen}
                onToggle={setStatusFilterOpen}
                target={ref}
                value={selectedStatus}
                isDisabled={isDisabled}
            >
                <DropdownBody>
                    <ul className={css.customerTimelineStatusList}>
                        {STATUS_FILTERS.map((option) => (
                            <DropdownItem
                                key={option.value}
                                option={option}
                                onClick={toggleSelectedStatus}
                            />
                        ))}
                    </ul>
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
