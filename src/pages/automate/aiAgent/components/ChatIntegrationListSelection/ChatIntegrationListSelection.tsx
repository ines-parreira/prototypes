import React, {useRef, useState} from 'react'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import {SelfServiceChatChannel} from 'pages/automate/common/hooks/useSelfServiceChatChannels'

export type ChatItem = {name: string; id: string}

type ChatIntegrationListSelectionProps = {
    /**
     * nextSelectedIds designates the next selected chat integration ids list
     */
    onSelectionChange: (nextSelectedIds: number[]) => void
    /**
     * Selected chat integration ids list
     */
    selectedIds: number[]
    /**
     * Chat integration list to compute the dropdown items
     */
    chatItems: SelfServiceChatChannel[]
    hasError?: boolean
}

export const ChatIntegrationListSelection = ({
    onSelectionChange,
    selectedIds,
    chatItems,
    hasError = false,
}: ChatIntegrationListSelectionProps) => {
    // refs to work with the selector component
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isDropdownOpened, setIsDropdownOpened] = useState(false)

    // used to display the list of selected chats when the dropdown is closed
    const selectedChatLabels = selectedIds
        .map((selectedId) =>
            chatItems.find((chat) => chat.value.id === selectedId)
        )
        .filter((input): input is SelfServiceChatChannel => Boolean(input))
        .map((selectedChat) => selectedChat?.value.name)

    // handle the toggle action on a list item then send the resulting list
    const handleIdToggled = (id: number) => {
        if (selectedIds.includes(id)) {
            const nextSelectedIds = selectedIds.filter(
                (selectedId) => selectedId !== id
            )

            onSelectionChange(nextSelectedIds)
        } else {
            const nextSelectedIds = [...selectedIds, id]
            onSelectionChange(nextSelectedIds)
        }
    }

    return (
        <SelectInputBox
            floating={floatingRef}
            label={selectedChatLabels}
            onToggle={setIsDropdownOpened}
            placeholder="Select one or more chat addresses"
            hasError={hasError}
            ref={targetRef}
            testId="chat-dropdown"
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        isMultiple
                        isOpen={isDropdownOpened}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={selectedIds}
                    >
                        <DropdownSearch autoFocus />
                        <DropdownBody>
                            {chatItems
                                .filter(({value}) => !!value.meta.app_id)
                                .map(({value}) => (
                                    <DropdownItem
                                        key={value.id}
                                        testId={`chat-dropdown-item-${value.meta.app_id}`}
                                        option={{
                                            label: value.name,
                                            value: value.id,
                                        }}
                                        onClick={handleIdToggled}
                                    >
                                        {value.name}
                                    </DropdownItem>
                                ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
