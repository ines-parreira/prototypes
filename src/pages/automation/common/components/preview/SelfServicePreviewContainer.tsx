import React, {ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {useHistory} from 'react-router-dom'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SourceIcon from 'pages/common/components/SourceIcon'
import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'

import css from './SelfServicePreviewContainer.less'

type Props<Channel extends SelfServiceChannel> = {
    channel?: Channel
    onChange: (channel?: Channel) => void
    channels: Channel[]
    alert?: {
        message: ReactNode
        action?: {message: string; href: string}
    }
    children: (channel: Channel) => void
}

const SelfServicePreviewContainer = <Channel extends SelfServiceChannel>({
    channel,
    onChange,
    channels,
    alert,
    children,
}: Props<Channel>) => {
    const history = useHistory()
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)

    const options = useMemo(
        () =>
            channels.map((channel) => ({
                type: channel.type,
                value: `${channel.type}:${channel.value.id}`,
                label: channel.value.name,
                channel,
            })),
        [channels]
    )

    useEffect(() => {
        if (!channel || !channels.includes(channel)) {
            onChange(channels[0])
        }
    }, [channel, channels, onChange])

    const handleChange = (nextValue: string) => {
        onChange(options.find((option) => option.value === nextValue)?.channel)
    }

    const alertAction = alert?.action
    const value = channel ? `${channel.type}:${channel.value.id}` : undefined

    return (
        <div className={css.container}>
            <div className={css.header}>Customer preview</div>
            <SelectInputBox
                className={css.selectInput}
                placeholder="Channel"
                floating={floatingRef}
                label={channel?.value?.name}
                onToggle={setIsSelectOpen}
                ref={targetRef}
                isDisabled={!channels.length}
                prefix={
                    channel && (
                        <SourceIcon
                            type={channel.type}
                            className={css.selectInputIcon}
                        />
                    )
                }
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isSelectOpen}
                            isDisabled={!channels.length}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                        >
                            <DropdownBody>
                                {options.map((option) => (
                                    <DropdownItem
                                        key={option.value}
                                        option={option}
                                        onClick={handleChange}
                                        shouldCloseOnSelect
                                        autoFocus
                                    >
                                        <SourceIcon
                                            type={option.type}
                                            className={css.dropdownItemIcon}
                                        />
                                        {option.label}
                                    </DropdownItem>
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            {channel
                ? children(channel)
                : alert && (
                      <Alert
                          className={css.alert}
                          type={AlertType.Warning}
                          icon
                          customActions={
                              alertAction && (
                                  <Button
                                      fillStyle="ghost"
                                      size="small"
                                      onClick={() => {
                                          history.push(alertAction.href)
                                      }}
                                  >
                                      {alertAction.message}
                                  </Button>
                              )
                          }
                      >
                          {alert.message}
                      </Alert>
                  )}
        </div>
    )
}

export default SelfServicePreviewContainer
