import React, {useMemo, useRef} from 'react'

import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import {TicketMessageSourceType} from 'business/types/ticket'
import useOutboundChannels from 'hooks/useOutboundChannels'
import useShortcuts from 'hooks/useShortcuts'
import {isTicketMessageSourceType} from 'models/ticket/predicates'
import SourceIcon from 'pages/common/components/SourceIcon'
import {humanizeChannel} from 'state/ticket/utils'

import ConvertToForwardPopover from './ConvertToForwardPopover'
import css from './ChannelSelect.less'

export default function ChannelSelect() {
    const {channels, selectedChannel, selectChannel} = useOutboundChannels()
    const dropdownToggleRef = useRef<HTMLElement | null>(null)

    const keymapActions = useMemo(
        () => ({
            FORWARD_REPLY: {
                action: (e: Event) => {
                    e.preventDefault()
                    selectChannel(TicketMessageSourceType.EmailForward)
                },
            },
            INTERNAL_NOTE_REPLY: {
                action: (e: Event) => {
                    e.preventDefault()
                    selectChannel(TicketMessageSourceType.InternalNote)
                },
            },
        }),
        [selectChannel]
    )

    useShortcuts('TicketDetailContainer', keymapActions)

    return (
        <div className={css.container}>
            <UncontrolledDropdown>
                <DropdownToggle
                    caret
                    color=""
                    type="button"
                    className={css.dropdownToggle}
                    innerRef={dropdownToggleRef}
                >
                    {isTicketMessageSourceType(selectedChannel) ? (
                        <SourceIcon type={selectedChannel} className="md-2" />
                    ) : (
                        <SourceIcon
                            type={selectedChannel?.slug}
                            className={css.newChannelIcon}
                        />
                    )}
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
        </div>
    )
}
