import React from 'react'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {SegmentEvent, logEvent} from 'common/segment'

type Props = {
    isToggled: boolean
    onUpdate: (value: boolean) => void
    channel: 'email' | 'chat'
}

export const ChannelToggleInput = ({isToggled, onUpdate, channel}: Props) => {
    const handleClick = () => {
        onUpdate(!isToggled)

        if (isToggled) {
            const event =
                channel === 'chat'
                    ? SegmentEvent.AiAgentChatConfigurationDisabled
                    : SegmentEvent.AiAgentEmailConfigurationDisabled
            logEvent(event)
        }
    }

    return (
        <ToggleInput
            isToggled={isToggled}
            onClick={handleClick}
            name={`toggle-ai-agent-${channel}`}
            // Add new candu selectors after we define them
            dataCanduId={
                channel === 'email' ? 'ai-agent-configuration-toggle' : ''
            }
        >
            Enable AI Agent on {channel === 'chat' ? 'Chat' : 'Email'}
        </ToggleInput>
    )
}
