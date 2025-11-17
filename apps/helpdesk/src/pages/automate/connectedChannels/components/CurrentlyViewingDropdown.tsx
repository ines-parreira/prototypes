import React, { useMemo } from 'react'

import classNames from 'classnames'
import { startCase } from 'lodash'
import { Link } from 'react-router-dom'

import {
    LegacyButton as Button,
    LegacyLabel as Label,
    Separator,
} from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import type { SelfServiceChannel } from 'pages/automate/common/hooks/useSelfServiceChannels'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'

import css from './CurrentlyViewingDropdown.less'

type ChannelType = 'help-center' | 'chat' | 'contact-form'

const renderIconByChannelType = (
    channelType: ChannelType,
    isOnButton: boolean = false,
) => {
    switch (channelType) {
        case 'chat':
            return isOnButton ? 'chat_bubble' : 'forum'
        case 'help-center':
            return 'live_help'
        case 'contact-form':
            return 'edit_note'
    }
}

const getLinkAndLabel = (channelType: ChannelType, id: string | number) => {
    switch (channelType) {
        case 'chat':
            return {
                link: `/app/settings/channels/gorgias_chat/${id}`,
                label: 'Chat',
            }
        case 'help-center':
            return {
                link: `/app/settings/help-center/${id}/articles`,
                label: 'Help Center',
            }
        case 'contact-form':
            return {
                link: `/app/settings/contact-form/${id}`,
                label: 'Contact Form',
            }
    }
}

interface Props<T extends SelfServiceChannel> {
    channelType: ChannelType
    value: string | number
    label: string
    appId: string | number
    channels: T[]
    showConnectCallToAction?: boolean
    onConnect?: () => void
    onSelectedChannelChange: (value: string | number) => void
    renderOption: (channel: T) => {
        label: string
        value: string | number
    }
}
export const CurrentlyViewingDropdown = <T extends SelfServiceChannel>({
    channelType,
    channels,
    value,
    label,
    appId,
    showConnectCallToAction,
    onSelectedChannelChange,
    renderOption,
}: Props<T>) => {
    const [isSelectOpen, setIsSelectOpen] = React.useState(false)
    const targetRef = React.useRef<HTMLButtonElement>(null)
    const isAutomateSettings = useIsAutomateSettings()

    const { link, label: channelTypeLabel } = getLinkAndLabel(
        channelType,
        appId,
    )

    const groupedChannels = useMemo(
        () => [
            {
                label: 'Chat',
                channels: channels.filter(
                    (channel) => channel.type === TicketChannel.Chat,
                ),
                link: '/app/settings/channels/gorgias_chat',
            },
            {
                label: 'Help Center',
                channels: channels.filter(
                    (channel) => channel.type === TicketChannel.HelpCenter,
                ),
                link: '/app/settings/help-center',
            },
            {
                label: 'Contact Form',
                channels: channels.filter(
                    (channel) => channel.type === TicketChannel.ContactForm,
                ),
                link: '/app/settings/contact-form',
            },
        ],
        [channels],
    )

    return (
        <div className={css.currentlyViewingDropdown}>
            <Label>Currently viewing</Label>

            <div className={css.currentlyViewingDropdownHeader}>
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    aria-label="Currently viewing"
                    ref={targetRef}
                    className={css.dropdownButton}
                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                >
                    <i
                        className={classNames(
                            'material-icons',
                            css.channelIcon,
                        )}
                    >
                        {renderIconByChannelType(channelType, true)}
                    </i>
                    <span className={css.dropDownLabel}>{label}</span>
                    <div className={css.dropdownButtonSpacer} />
                    <i className={classNames('material-icons', css.arrowDown)}>
                        arrow_drop_down
                    </i>
                </Button>
                <Button intent="secondary" fillStyle="ghost">
                    <Link
                        to={link}
                        className={css.channelTypeSettingsLink}
                        target="_blank"
                        role="link"
                    >
                        <ButtonIconLabel icon="open_in_new" position="right">
                            {channelTypeLabel} Settings
                        </ButtonIconLabel>
                    </Link>
                </Button>
            </div>
            <Dropdown
                isOpen={isSelectOpen}
                onToggle={setIsSelectOpen}
                target={targetRef}
                value={value}
            >
                <DropdownBody>
                    {isAutomateSettings ? (
                        <>
                            {groupedChannels.map((channelGroup, index) => (
                                <div
                                    key={channelGroup.label}
                                    className={css.dropdownGroup}
                                >
                                    <Label className={css.dropdownGroupLabel}>
                                        {channelGroup.label}
                                    </Label>
                                    {channelGroup.channels.map((channel) => (
                                        <DropdownItem
                                            key={renderOption(channel).value}
                                            option={renderOption(channel)}
                                            onClick={onSelectedChannelChange}
                                            shouldCloseOnSelect
                                            className={css.dropdownItem}
                                        >
                                            <i
                                                className={classNames(
                                                    'material-icons',
                                                    css.channelIcon,
                                                )}
                                            >
                                                {renderIconByChannelType(
                                                    channelType,
                                                )}
                                            </i>
                                            {renderOption(channel).label}
                                        </DropdownItem>
                                    ))}
                                    {channelGroup.channels.length === 0 && (
                                        <Link
                                            to={channelGroup.link}
                                            className={css.dropdownGroupLink}
                                        >
                                            Go to {channelGroup.label}
                                        </Link>
                                    )}
                                    {index !== groupedChannels.length - 1 && (
                                        <Separator
                                            className={
                                                css.dropdownGroupSeparator
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            {channels.map((channel) => (
                                <DropdownItem
                                    key={renderOption(channel).value}
                                    option={renderOption(channel)}
                                    onClick={onSelectedChannelChange}
                                    shouldCloseOnSelect
                                    className={css.dropdownItem}
                                >
                                    <i
                                        className={classNames(
                                            'material-icons',
                                            css.channelIcon,
                                        )}
                                    >
                                        {renderIconByChannelType(channelType)}
                                    </i>
                                    {renderOption(channel).label}
                                </DropdownItem>
                            ))}
                        </>
                    )}

                    {showConnectCallToAction && (
                        <DropdownItem
                            option={{
                                label: 'Add channel',
                                value: 'add-channel',
                            }}
                            onClick={() => {}}
                            shouldCloseOnSelect
                            className={css.dropdownCtaItem}
                        >
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.chatCtaIcon,
                                )}
                            >
                                add
                            </i>
                            Connect another{' '}
                            {startCase(channelType.replace('-', ' '))} to this
                            store
                        </DropdownItem>
                    )}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
