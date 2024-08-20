import React from 'react'
import {Label} from '@gorgias/ui-kit'
import classNames from 'classnames'
import {startCase} from 'lodash'
import {Link} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import css from './CurrentlyViewingDropdown.less'

type ChannelType = 'help-center' | 'chat' | 'contact-form'

const renderIconByChannelType = (channelType: ChannelType) => {
    switch (channelType) {
        case 'chat':
            return 'forum'
        case 'help-center':
            return 'live_help'
        case 'contact-form':
            return 'edit_note'
    }
}

const getLinkAndLabel = (channelType: ChannelType) => {
    switch (channelType) {
        case 'chat':
            return {link: '/app/settings/channels/gorgias_chat', label: 'Chat'}
        case 'help-center':
            return {
                link: '/app/settings/help-center',
                label: 'Help Center',
            }
        case 'contact-form':
            return {
                link: '/app/settings/contact-form',
                label: 'Contact Form',
            }
    }
}
interface Props<T> {
    channelType: ChannelType
    value: string | number
    label: string
    channels: T[]
    showConnectCallToAction?: boolean
    onConnect?: () => void
    onSelectedChannelChange: (value: string | number) => void
    renderOption: (channel: T) => {
        label: string
        value: string | number
    }
}
export const CurrentlyViewingDropdown = <T,>({
    channelType,
    channels,
    value,
    label,
    showConnectCallToAction,
    onSelectedChannelChange,
    renderOption,
}: Props<T>) => {
    const [isSelectOpen, setIsSelectOpen] = React.useState(false)
    const targetRef = React.useRef<HTMLButtonElement>(null)

    const {link, label: channelTypeLabel} = getLinkAndLabel(channelType)

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
                            css.channelIcon
                        )}
                    >
                        {renderIconByChannelType(channelType)}
                    </i>
                    <span>{label}</span>
                    <div className={css.dropdownButtonSpacer} />
                    <i className="material-icons">keyboard_arrow_down</i>
                </Button>
                <Button intent="secondary" fillStyle="ghost">
                    <Link to={link} className={css.channelTypeSettingsLink}>
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
                                    css.channelIcon
                                )}
                            >
                                {renderIconByChannelType(channelType)}
                            </i>
                            {renderOption(channel).label}
                        </DropdownItem>
                    ))}
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
                                    css.chatCtaIcon
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
