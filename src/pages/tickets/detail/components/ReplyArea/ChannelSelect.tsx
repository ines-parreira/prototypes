import React, {useMemo, useRef} from 'react'

import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import {isTicketMessageSourceType} from 'models/ticket/predicates'
import {humanizeChannel} from 'state/ticket/utils'
import useOutboundChannels from 'hooks/useOutboundChannels'
import {KeymapActions} from 'services/shortcutManager/shortcutManager'
import {TicketMessageSourceType} from 'business/types/ticket'
import KeyboardShortcuts from 'pages/common/components/KeyboardShortcuts'

import SourceIcon from 'pages/common/components/SourceIcon'

import ConvertToForwardPopover from './ConvertToForwardPopover'
import css from './ChannelSelect.less'

export default function ChannelSelect() {
    const {channels, selectedChannel, selectChannel} = useOutboundChannels()
    const dropdownToggleRef = useRef<HTMLElement | null>(null)

    const keymapActions: KeymapActions = useMemo(
        () => ({
            FORWARD_REPLY: {
                action: (e: Event) => {
                    e.preventDefault()
                    selectChannel(TicketMessageSourceType.EmailForward)
                },
                key: 'f',
            },
            INTERNAL_NOTE_REPLY: {
                action: (e) => {
                    e.preventDefault()
                    selectChannel(TicketMessageSourceType.InternalNote)
                },
                key: 'i',
            },
        }),
        [selectChannel]
    )

    return (
        <div className="mt-1 mr-2">
            <UncontrolledDropdown>
                <DropdownToggle
                    caret
                    color=""
                    type="button"
                    className={css.dropdownToggle}
                    innerRef={dropdownToggleRef}
                >
                    <SourceIcon
                        type={
                            isTicketMessageSourceType(selectedChannel)
                                ? selectedChannel
                                : selectedChannel?.slug
                        }
                        className="md-2"
                    />
                </DropdownToggle>
                <ConvertToForwardPopover target={dropdownToggleRef} />
                <DropdownMenu>
                    {channels.map((channel) => {
                        if (isTicketMessageSourceType(channel)) {
                            return (
                                <DropdownItem
                                    key={channel}
                                    type="button"
                                    onClick={() => selectChannel(channel)}
                                >
                                    <SourceIcon type={channel} />
                                    {humanizeChannel(channel)}
                                </DropdownItem>
                            )
                        }

                        return (
                            <DropdownItem
                                key={channel.slug}
                                type="button"
                                onClick={() => selectChannel(channel)}
                            >
                                <SourceIcon type={channel.slug} />
                                {channel.name}
                            </DropdownItem>
                        )
                    })}
                </DropdownMenu>
            </UncontrolledDropdown>
            <KeyboardShortcuts
                name="TicketDetailContainer"
                keymap={keymapActions}
            />
        </div>
    )
}
