import {
    Card,
    Elevation,
    Heading,
    Radio,
    RadioGroup,
    Text,
} from '@gorgias/axiom'

import {
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'

import css from '../GorgiasChatIntegrationPreferences.less'

const defaultOptions = [
    {
        value: GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        label: 'Live when agents are available',
        caption:
            'Shoppers can only send live chat messages when an agent is available in Gorgias.',
    },
    {
        value: GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
        label: 'Always live during business hours',
        caption:
            'Shoppers can always send live chat messages during business hours.',
    },
    {
        value: GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
        label: 'Offline (capture messages only)',
        caption: 'Shoppers can only leave messages through the offline form.',
    },
]

const aiAgentOptions = [
    {
        value: GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
        label: 'Only outside business hours',
        caption:
            'Shoppers stay in chat during business hours, even if no agent is live. Outside business hours, AI Agent hands over by email.',
    },
    {
        value: GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
        label: 'When no agent is live on chat',
        caption:
            'If an agent is available, handover stays in chat. If no agent is available (outside business hours or no one live), AI Agent hands over by email.',
    },
    {
        value: GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
        label: 'Always transfer to email',
        caption:
            'Every handover goes to email, regardless of agent availability.',
    },
]

type Props = {
    liveChatAvailability: string
    onChange: (value: string) => void
    isAiAgentEnabled?: boolean
}

export const ChatAvailabilityCard = ({
    liveChatAvailability,
    onChange,
    isAiAgentEnabled = false,
}: Props) => {
    const title = isAiAgentEnabled ? 'Handover to email' : 'Chat availability'
    const description = isAiAgentEnabled
        ? 'Choose when the AI Agent should hand over to your team by email instead of keeping the conversation in chat. Outside of these cases, handover stays in chat and an agent takes over when available.'
        : 'Control when shoppers can start a live chat and what happens outside business hours.'
    const options = isAiAgentEnabled ? aiAgentOptions : defaultOptions

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">{title}</Heading>
                    <Text size="md" className={css.cardDescription}>
                        {description}
                    </Text>
                </div>

                <div className={css.radioGroupWrapper}>
                    <RadioGroup
                        value={liveChatAvailability}
                        onChange={onChange}
                        flexDirection="column"
                        gap="xs"
                    >
                        {options.map((option) => (
                            <Radio
                                key={option.value}
                                value={option.value}
                                label={option.label}
                                caption={option.caption}
                            />
                        ))}
                    </RadioGroup>
                </div>

                {isAiAgentEnabled && (
                    <Text size="sm" className={css.cardDescription}>
                        AI Agent is always active in chat. These settings only
                        control what happens after AI Agent hands over to your
                        team.
                    </Text>
                )}
            </div>
        </Card>
    )
}
