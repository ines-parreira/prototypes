import React, { useRef, useState } from 'react'

import classNames from 'classnames'

import useVoiceCallFilterOptions from 'domains/reporting/pages/voice/components/VoiceCallFilter/useVoiceCallFilterOptions'
import css from 'domains/reporting/pages/voice/components/VoiceCallFilter/VoiceCallFilter.less'
import type { VoiceCallFilterOptions } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallFilterDirection } from 'domains/reporting/pages/voice/models/types'
import type { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import { getPrettyVoiceCallDisplayStatusName } from 'models/voiceCall/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownQuickSelect from 'pages/common/components/dropdown/DropdownQuickSelect'
import * as ToggleButton from 'pages/common/components/ToggleButton'

export default function VoiceCallFilter({
    onFilterSelect,
}: {
    onFilterSelect: (value: VoiceCallFilterOptions) => void
}) {
    const divRef = useRef<HTMLDivElement>(null)

    const {
        selectedDirection,
        statusFilter,
        fullStatusFilter,
        updateFilter,
        updateFilterFromDirection,
        toggleStatusFromFilter,
        removeAllStatusFilter,
        selectAllStatusFilter,
    } = useVoiceCallFilterOptions(onFilterSelect)

    const [dropdownOpen, setDropdownOpen] = useState(false)

    const isDropdownEnabled = statusFilter && fullStatusFilter

    const getDropdownLabel = () => {
        switch (selectedDirection) {
            case VoiceCallFilterDirection.All:
                return 'Select filter'
            case VoiceCallFilterDirection.Inbound:
            case VoiceCallFilterDirection.Outbound:
                return displayPrettyStatusFilters(statusFilter ?? [])
        }
    }

    const onToggleDropdown = () => {
        setDropdownOpen((prevState) => !prevState)
        updateFilter()
    }

    return (
        <div className={css.wrapper}>
            <ToggleButton.Wrapper
                type={ToggleButton.Type.Label}
                value={selectedDirection}
                onChange={updateFilterFromDirection}
                size="small"
            >
                <ToggleButton.Option value={VoiceCallFilterDirection.All}>
                    All
                </ToggleButton.Option>
                <ToggleButton.Option value={VoiceCallFilterDirection.Inbound}>
                    Inbound
                </ToggleButton.Option>
                <ToggleButton.Option value={VoiceCallFilterDirection.Outbound}>
                    Outbound
                </ToggleButton.Option>
            </ToggleButton.Wrapper>
            <div
                className={classNames(css.toggleButton, {
                    [css.toggleButtonDisabled]: !isDropdownEnabled,
                })}
                onClick={isDropdownEnabled ? onToggleDropdown : undefined}
                ref={divRef}
            >
                <span className={css.toggleButtonLabel}>
                    {getDropdownLabel()}
                </span>
                <ButtonIconLabel icon="arrow_drop_down" position="right" />
            </div>
            {isDropdownEnabled && (
                <Dropdown
                    isOpen={dropdownOpen}
                    target={divRef}
                    onToggle={onToggleDropdown}
                    placement="bottom"
                    isMultiple={true}
                    value={statusFilter}
                >
                    <DropdownQuickSelect
                        onRemoveAll={removeAllStatusFilter}
                        onSelectAll={selectAllStatusFilter}
                        values={statusFilter}
                    />
                    <DropdownBody>
                        {fullStatusFilter.map((option) => (
                            <DropdownItem
                                key={option}
                                option={{
                                    label:
                                        getPrettyVoiceCallDisplayStatusName(
                                            option,
                                        ) ?? '',
                                    value: option,
                                }}
                                onClick={toggleStatusFromFilter}
                            >
                                {getPrettyVoiceCallDisplayStatusName(option)}
                            </DropdownItem>
                        ))}
                    </DropdownBody>
                </Dropdown>
            )}
        </div>
    )
}

const displayPrettyStatusFilters = (statusFilter: VoiceCallDisplayStatus[]) => {
    if (statusFilter.length === 0) {
        return 'Select filter'
    }
    return statusFilter
        .map((status) => getPrettyVoiceCallDisplayStatusName(status))
        .join(', ')
}
