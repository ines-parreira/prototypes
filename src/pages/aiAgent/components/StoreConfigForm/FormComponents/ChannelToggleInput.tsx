import { logEvent, SegmentEvent } from 'common/segment'
import ToggleInput from 'pages/common/forms/ToggleInput'

type Props = {
    isToggled: boolean
    onUpdate: (value: boolean) => void
    channel: 'email' | 'chat'
    isDisabled?: boolean
}

export const ChannelToggleInput = ({
    isToggled,
    onUpdate,
    channel,
    isDisabled,
}: Props) => {
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
                channel === 'email'
                    ? 'ai-agent-configuration-toggle'
                    : 'ai-agent-configuration-chat-toggle'
            }
            isDisabled={isDisabled}
        >
            Enable AI Agent
        </ToggleInput>
    )
}
