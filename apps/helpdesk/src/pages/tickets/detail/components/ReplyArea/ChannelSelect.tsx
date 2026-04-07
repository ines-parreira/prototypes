import { useMemo, useRef } from 'react'

import { useShortcuts } from '@repo/utils'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import { TicketMessageSourceType } from 'business/types/ticket'
import useOutboundChannels from 'hooks/useOutboundChannels'
import { isTicketMessageSourceType } from 'models/ticket/predicates'
import SourceIcon from 'pages/common/components/SourceIcon'
import type { Channel } from 'services/channels'
import { humanizeChannel } from 'state/ticket/utils'

import ConvertToForwardPopover from './ConvertToForwardPopover'

import css from './ChannelSelect.less'

type Props = {
    channelsOverride?: Array<Channel | TicketMessageSourceType>
    selectedChannelOverride?: Maybe<Channel | TicketMessageSourceType>
}

export default function ChannelSelect({
    channelsOverride,
    selectedChannelOverride,
}: Props) {
    const { channels, selectedChannel, selectChannel } = useOutboundChannels()
    const dropdownToggleRef = useRef<HTMLElement | null>(null)
    const availableChannels = channelsOverride ?? channels
    const currentSelectedChannel = selectedChannelOverride ?? selectedChannel
    const hasEmailForwardChannel = availableChannels.includes(
        TicketMessageSourceType.EmailForward,
    )
    const hasInternalNoteChannel = availableChannels.includes(
        TicketMessageSourceType.InternalNote,
    )

    const keymapActions = useMemo(
        () => ({
            ...(hasEmailForwardChannel
                ? {
                      FORWARD_REPLY: {
                          action: (e: Event) => {
                              e.preventDefault()
                              selectChannel(
                                  TicketMessageSourceType.EmailForward,
                              )
                          },
                      },
                  }
                : {}),
            ...(hasInternalNoteChannel
                ? {
                      INTERNAL_NOTE_REPLY: {
                          action: (e: Event) => {
                              e.preventDefault()
                              selectChannel(
                                  TicketMessageSourceType.InternalNote,
                              )
                          },
                      },
                  }
                : {}),
        }),
        [hasEmailForwardChannel, hasInternalNoteChannel, selectChannel],
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
                    {isTicketMessageSourceType(currentSelectedChannel) ? (
                        <SourceIcon
                            type={currentSelectedChannel}
                            className="md-2"
                        />
                    ) : (
                        <SourceIcon
                            type={currentSelectedChannel?.slug}
                            className={css.newChannelIcon}
                        />
                    )}
                </DropdownToggle>
                <ConvertToForwardPopover target={dropdownToggleRef} />
                <DropdownMenu>
                    {availableChannels.map((channel) => {
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
