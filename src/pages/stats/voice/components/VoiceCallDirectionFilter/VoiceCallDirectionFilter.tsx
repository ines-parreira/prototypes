import React, { useState } from 'react'

import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
} from 'reactstrap'

import { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {
    ALL_CALLS_FILTER_LABEL,
    INBOUND_CALLS_FILTER_LABEL,
    MISSED_CALLS_FILTER_LABEL,
    OUTBOUND_CALLS_FILTER_LABEL,
} from 'pages/stats/voice/constants/voiceOverview'
import {
    VoiceCallFilterDirection,
    VoiceCallFilterOptions,
} from 'pages/stats/voice/models/types'

import css from './VoiceCallDirectionFilter.less'

type Option = {
    label: string
    value: VoiceCallFilterOptions
}
function VoiceCallDirectionFilter({
    onFilterSelect,
}: {
    onFilterSelect: (value: VoiceCallFilterOptions) => void
}) {
    const options: Option[] = [
        {
            label: ALL_CALLS_FILTER_LABEL,
            value: { direction: VoiceCallFilterDirection.All },
        },
        {
            label: OUTBOUND_CALLS_FILTER_LABEL,
            value: { direction: VoiceCallFilterDirection.Outbound },
        },
        {
            label: INBOUND_CALLS_FILTER_LABEL,
            value: { direction: VoiceCallFilterDirection.Inbound },
        },
        {
            label: MISSED_CALLS_FILTER_LABEL,
            value: {
                direction: VoiceCallFilterDirection.Inbound,
                statuses: [
                    VoiceCallDisplayStatus.Abandoned,
                    VoiceCallDisplayStatus.Missed,
                    VoiceCallDisplayStatus.Cancelled,
                ],
            },
        },
    ]

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [selectedOption, setSelectedOption] = useState(options[0])

    const toggle = () => setDropdownOpen((prevState) => !prevState)
    const selectOption = (option: Option) => {
        setSelectedOption(option)
        onFilterSelect(option.value)
    }

    return (
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle tag="span">
                <div className={css.toggleButton}>
                    {selectedOption.label}
                    <ButtonIconLabel icon="arrow_drop_down" position="right" />
                </div>
            </DropdownToggle>
            <DropdownMenu className={css.menu}>
                {options.map((option) => (
                    <DropdownItem
                        key={option.label}
                        onClick={() => selectOption(option)}
                    >
                        {option.label}
                    </DropdownItem>
                ))}
            </DropdownMenu>
        </Dropdown>
    )
}

export default VoiceCallDirectionFilter
