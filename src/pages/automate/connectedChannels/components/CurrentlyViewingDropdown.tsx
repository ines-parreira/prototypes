import React from 'react'
import {Label} from '@gorgias/ui-kit'
import classNames from 'classnames'
import {startCase} from 'lodash'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import css from './CurrentlyViewingDropdown.less'

type ChannelType = 'help-center' | 'chat' | 'contact-form' | 'email'

const renderIconByChannelType = (channelType: ChannelType) => {
    switch (channelType) {
        case 'chat':
            return 'forum'
        case 'help-center':
            return 'live_help'
        case 'contact-form':
            return 'edit_note'
        case 'email':
            return 'email'
    }
}

interface Props<T> {
    channelType: 'help-center' | 'chat' | 'contact-form' | 'email'
    value: string | number
    label: string
    channels: T[]
    onConnect: () => void
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
    onSelectedChannelChange,
    renderOption,
}: Props<T>) => {
    const [isSelectOpen, setIsSelectOpen] = React.useState(false)
    const targetRef = React.useRef<HTMLButtonElement>(null)

    return (
        <div className={css.currentlyViewingDropdown}>
            <Label>Currently viewing</Label>
            <Button
                intent="secondary"
                fillStyle="ghost"
                aria-label="Currently viewing"
                ref={targetRef}
                className={css.dropdownButton}
                onClick={() => setIsSelectOpen(!isSelectOpen)}
            >
                <i className="material-icons">
                    {renderIconByChannelType(channelType)}
                </i>
                <span>{label}</span>
                <div className={css.dropdownButtonSpacer} />
                <i className="material-icons">keyboard_arrow_down</i>
            </Button>
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
                                    css.chatItemIcon
                                )}
                            >
                                {renderIconByChannelType(channelType)}
                            </i>
                            {renderOption(channel).label}
                        </DropdownItem>
                    ))}
                    <DropdownItem
                        option={{label: 'Add channel', value: 'add-channel'}}
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
                        {startCase(channelType.replace('-', ' '))} to this store
                    </DropdownItem>
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
