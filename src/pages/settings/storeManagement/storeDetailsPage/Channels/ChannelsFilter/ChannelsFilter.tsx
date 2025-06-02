import { Dispatch, SetStateAction, useRef, useState } from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'

import deriveLabelFromIntegration from '../../../helpers/deriveLabelFromIntegration'
import { ChannelWithMetadata } from '../../../types'
import CreateNewChannel from './CreateNewChannel'
import UnselectableItems from './UnselectableItems'

interface ChannelsFilterProps {
    selectorLabel: string
    activeChannel?: ChannelWithMetadata
    assignedChannelIds: number[]
    setAssignedChannelIds: Dispatch<SetStateAction<number[]>>
}

export default function ChannelsFilter({
    selectorLabel,
    activeChannel,
    assignedChannelIds,
    setAssignedChannelIds,
}: ChannelsFilterProps) {
    const [selectedFilterItems, setSelectedFilterItems] = useState<number[]>([])

    const handleFilterClose = () => {
        setAssignedChannelIds((prev) => [...prev, ...selectedFilterItems])
        setSelectedFilterItems([])
    }

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const onToggle = () => {
        if (isDropdownOpen) {
            handleFilterClose()
        }

        setIsDropdownOpen(!isDropdownOpen)
    }

    if (!activeChannel) {
        return null
    }

    const availableChannels = [
        ...activeChannel.unassignedChannels,
        ...activeChannel.assignedChannels,
    ].filter((channel) => !assignedChannelIds.includes(channel.id))

    const handleItemClick = (value: number) => {
        const newSelectedItems = selectedFilterItems.includes(value)
            ? selectedFilterItems.filter((item) => item !== value)
            : [...selectedFilterItems, value]
        setSelectedFilterItems(newSelectedItems)
    }

    return (
        <>
            <div>
                <Button
                    onClick={onToggle}
                    ref={buttonRef}
                    intent="secondary"
                    trailingIcon="arrow_drop_down"
                >
                    {selectorLabel}
                </Button>
            </div>

            <Dropdown
                isMultiple
                isOpen={isDropdownOpen}
                onToggle={onToggle}
                target={buttonRef}
                value={selectedFilterItems}
            >
                <DropdownSearch autoFocus />
                <DropdownBody>
                    {availableChannels.map((channel) => (
                        <DropdownItem
                            key={channel.id}
                            option={{
                                label: deriveLabelFromIntegration(channel),
                                value: channel.id,
                            }}
                            onClick={handleItemClick}
                        />
                    ))}
                    <UnselectableItems activeChannel={activeChannel} />
                </DropdownBody>
                <CreateNewChannel activeChannel={activeChannel} />
            </Dropdown>
        </>
    )
}
