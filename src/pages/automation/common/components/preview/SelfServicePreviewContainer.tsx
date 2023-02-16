import React, {ReactNode, useEffect, useRef, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SourceIcon from 'pages/common/components/SourceIcon'

import css from './SelfServicePreviewContainer.less'

type Props<T extends GorgiasChatIntegration> = {
    channels: T[]
    alertActionMessage: string
    alertActionHref: string
    alertMessage: ReactNode
    children: (channel: T) => ReactNode
}

const SelfServicePreviewContainer = <T extends GorgiasChatIntegration>({
    channels,
    alertActionMessage,
    alertActionHref,
    alertMessage,
    children,
}: Props<T>) => {
    const history = useHistory()
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const [channel, setChannel] = useState<T | undefined>(channels[0])

    useEffect(() => {
        if (!channel || !channels.includes(channel)) {
            setChannel(channels[0])
        }
    }, [channel, channels])

    const handleChange = (nextValue: number) => {
        setChannel(channels.find((channel) => channel.id === nextValue))
    }
    const handleAlertActionClick = () => {
        history.push(alertActionHref)
    }

    return (
        <div className={css.container}>
            <div className={css.header}>Customer preview</div>
            <SelectInputBox
                className={css.selectInput}
                placeholder="Channel"
                floating={floatingRef}
                label={channel?.name}
                onToggle={setIsSelectOpen}
                ref={targetRef}
                prefix={
                    channel && (
                        <SourceIcon
                            type={IntegrationType.GorgiasChat}
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
                            value={channel?.id}
                        >
                            <DropdownBody>
                                {channels.map((channel) => (
                                    <DropdownItem
                                        key={channel.id}
                                        option={{
                                            label: channel.name,
                                            value: channel.id,
                                        }}
                                        onClick={handleChange}
                                        shouldCloseOnSelect
                                        autoFocus
                                    >
                                        <SourceIcon
                                            type={IntegrationType.GorgiasChat}
                                            className={css.dropdownItemIcon}
                                        />
                                        {channel.name}
                                    </DropdownItem>
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            {channel ? (
                children(channel)
            ) : (
                <Alert
                    className={css.alert}
                    type={AlertType.Warning}
                    icon
                    customActions={
                        <Button
                            fillStyle="ghost"
                            size="small"
                            onClick={handleAlertActionClick}
                        >
                            {alertActionMessage}
                        </Button>
                    }
                >
                    {alertMessage}
                </Alert>
            )}
        </div>
    )
}

export default SelfServicePreviewContainer
