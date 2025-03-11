import React, { ReactNode, useRef, useState } from 'react'

import { SelfServiceChatChannel } from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from './ChatIntegrationListSelection.less'

export type ChatItem = { name: string; id: string }

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
    /* id of connected label tag  */
    hasError?: boolean
    error?: string | ReactNode
    isDisabled?: boolean
    labelId?: string
    /**
     * Flag to display text indication when the item is disabled
     */
    withDisabledText?: boolean
    sortingCallback?: (
        a: SelfServiceChatChannel,
        b: SelfServiceChatChannel,
    ) => number
}

export const ChatIntegrationListSelection = ({
    onSelectionChange,
    selectedIds,
    chatItems,
    hasError = false,
    error,
    isDisabled,
    labelId,
    withDisabledText = false,
    sortingCallback = undefined,
}: ChatIntegrationListSelectionProps) => {
    // refs to work with the selector component
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const [isDropdownOpened, setIsDropdownOpened] = useState(false)

    if (sortingCallback !== undefined) {
        chatItems.sort(sortingCallback)
    }

    // used to display the list of selected chats when the dropdown is closed
    const selectedChatLabels = selectedIds
        .map((selectedId) =>
            chatItems.find((chat) => chat.value.id === selectedId),
        )
        .filter((input): input is SelfServiceChatChannel => Boolean(input))
        .map((selectedChat) => selectedChat?.value.name)

    // handle the toggle action on a list item then send the resulting list
    const handleIdToggled = (id: number) => {
        if (selectedIds.includes(id)) {
            const nextSelectedIds = selectedIds.filter(
                (selectedId) => selectedId !== id,
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
            placeholder="Select one or more chat integrations"
            hasError={hasError}
            error={error}
            ref={targetRef}
            aria-expanded={isDropdownOpened}
            aria-controls="chat-integrations-list"
            isDisabled={isDisabled}
            aria-labelledby={labelId}
        >
            <SelectInputBoxContext.Consumer>
                {(context) => (
                    <Dropdown
                        id="chat-integrations-list"
                        isMultiple
                        isOpen={isDropdownOpened}
                        onToggle={() => context!.onBlur()}
                        ref={floatingRef}
                        target={targetRef}
                        value={selectedIds}
                    >
                        <DropdownSearch autoFocus withClearText />
                        <DropdownBody>
                            {chatItems
                                .filter(({ value }) => !!value.meta.app_id)
                                .map(({ value }) => (
                                    <DropdownItem
                                        key={value.id}
                                        option={{
                                            label: value.name,
                                            value: value.id,
                                        }}
                                        onClick={handleIdToggled}
                                        isDisabled={value.isDisabled}
                                    >
                                        {value.isDisabled &&
                                        withDisabledText ? (
                                            <div
                                                className={
                                                    css['label-container']
                                                }
                                            >
                                                <div
                                                    className={
                                                        css['chat-label']
                                                    }
                                                >
                                                    {value.name}
                                                </div>
                                                <span
                                                    className={css['used-chat']}
                                                >
                                                    Chat already used by AI
                                                    Agent in another chat
                                                </span>
                                            </div>
                                        ) : (
                                            value.name
                                        )}
                                    </DropdownItem>
                                ))}
                        </DropdownBody>
                    </Dropdown>
                )}
            </SelectInputBoxContext.Consumer>
        </SelectInputBox>
    )
}
