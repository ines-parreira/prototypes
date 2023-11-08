import React from 'react'
import SelectFilter from 'pages/stats/common/SelectFilter'
import {Value} from 'pages/common/forms/SelectField/types'
import {HelpCenter} from 'models/helpCenter/types'

type HelpCenterFilterProps = {
    selectedHelpCenterIds: number[]
    helpCenters: HelpCenter[]
    setSelectedHelpCenter: (
        filterName: 'helpCenters',
        helpCenters: {helpCenters: number[]}
    ) => void
}

const HelpCenterFilter = ({
    selectedHelpCenterIds,
    setSelectedHelpCenter,
    helpCenters,
}: HelpCenterFilterProps) => {
    const onFilterChange = ([value]: Value[]) => {
        if (typeof value === 'number')
            setSelectedHelpCenter('helpCenters', {
                helpCenters: [value],
            })
    }

    return (
        <SelectFilter
            isRequired
            onChange={onFilterChange}
            value={selectedHelpCenterIds}
            isMultiple={false}
            singular="Select Help Center"
        >
            {helpCenters.map((helpCenter) => (
                <SelectFilter.Item
                    key={helpCenter.id}
                    label={helpCenter.name}
                    value={helpCenter.id}
                />
            ))}
        </SelectFilter>
    )
}

export default HelpCenterFilter
