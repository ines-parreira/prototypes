import React, { ReactNode, useMemo } from 'react'

import classnames from 'classnames'

import { Tooltip } from '@gorgias/axiom'

import {
    SelfServiceChannel,
    SelfServiceChannelType,
} from 'pages/automate/common/hooks/useSelfServiceChannels'
import { getChannelName } from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'

import ChannelsLink from './ChannelLink'

import css from '../WorkflowsPublisher.less'

type Props = {
    maxWorkflowsLimitReached: boolean
    channel: SelfServiceChannel
    toggleId: string
    onlySupportedChannels: SelfServiceChannelType[]
    missMatchMessage?: ReactNode
    isWorkflowEnabled: boolean
}

const ChannelWarning = ({
    maxWorkflowsLimitReached,
    channel,
    toggleId,
    onlySupportedChannels,
    missMatchMessage,
    isWorkflowEnabled,
}: Props) => {
    const iconId = `channel-warning-icon-${channel.type}-${channel.value.id}`

    const { message, icon } = useMemo(() => {
        let message = missMatchMessage
        let icon = 'error'

        if (onlySupportedChannels.length) {
            icon = ''
            message = `This Flow contains actions currently only supported in ${onlySupportedChannels
                .map(getChannelName)
                .join(' and ')}.`
        } else if (maxWorkflowsLimitReached && !isWorkflowEnabled) {
            icon = 'warning'
            message = (
                <>
                    You have reached the maximum number of enabled Flows in this
                    channel.{' '}
                    <ChannelsLink
                        type={channel.type}
                        id={channel.value.id}
                        linkText="Disable another Flow"
                    />{' '}
                    in order to enable this Flow.
                </>
            )
        }

        return { message, icon }
    }, [
        missMatchMessage,
        onlySupportedChannels,
        maxWorkflowsLimitReached,
        isWorkflowEnabled,
        channel.type,
        channel.value.id,
    ])

    if (!message) return <></>

    return (
        <div>
            {icon && (
                <i
                    id={iconId}
                    className={classnames('material-icons', css.warningIcon)}
                >
                    {icon}
                </i>
            )}
            <Tooltip
                placement="top-start"
                target={icon ? iconId : `${toggleId} + div`}
                trigger={['hover']}
                autohide={false}
            >
                {message}
            </Tooltip>
        </div>
    )
}
export default ChannelWarning
