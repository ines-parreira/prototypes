import React, {ReactNode, useEffect, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'

import {GorgiasChatIntegration, IntegrationType} from 'models/integration/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Option, Value} from 'pages/common/forms/SelectField/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
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
    const [channel, setChannel] = useState<T | undefined>(channels[0])

    const options = useMemo<Option[]>(
        () =>
            channels.map((option) => ({
                value: option.id,
                text: option.name,
                label: (
                    <span className={css.channelOption}>
                        <SourceIcon
                            type={IntegrationType.GorgiasChat}
                            className={css.channelOptionIcon}
                        />
                        {option.name}
                    </span>
                ),
            })),
        [channels]
    )

    useEffect(() => {
        if (!channel || !channels.includes(channel)) {
            setChannel(channels[0])
        }
    }, [channel, channels])

    const handleChange = (nextValue: Value) => {
        setChannel(channels.find((channel) => channel.id === nextValue))
    }
    const handleAlertActionClick = () => {
        history.push(alertActionHref)
    }

    return (
        <div className={css.container}>
            <div className={css.header}>Customer preview</div>
            <SelectField
                className={css.selectField}
                value={channel?.id}
                options={options}
                onChange={handleChange}
                placeholder="Channel"
                fullWidth
            />
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
