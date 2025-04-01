import { useRef, useState } from 'react'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import FilterName from 'pages/common/forms/FilterInput/FilterName'
import FilterValue from 'pages/common/forms/FilterInput/FilterValue'

import { STATUS_FILTERS } from './constants'
import { getOptionLabels } from './helpers/statusFilter'
import { FilterKey } from './types'

import css from './StatusFilter.less'

type Props = {
    selectedStatus: FilterKey[]
    toggleSelectedStatus: (newStatus: FilterKey) => void
}

export function StatusFilter({ selectedStatus, toggleSelectedStatus }: Props) {
    const ref = useRef<HTMLDivElement>(null)
    const [isStatusFilterOpen, setStatusFilterOpen] = useState(false)
    return (
        <div className={css.statusFilter}>
            <FilterName name="status" />
            <FilterValue
                ref={ref}
                optionsLabels={getOptionLabels(selectedStatus)}
                onClick={() => {
                    setStatusFilterOpen(true)
                }}
                placeholder="Select a status"
            />
            <Dropdown
                isMultiple
                isOpen={isStatusFilterOpen}
                onToggle={setStatusFilterOpen}
                target={ref}
                value={selectedStatus}
            >
                <DropdownBody>
                    <ul className={css.statusList}>
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
