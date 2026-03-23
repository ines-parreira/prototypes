import { Radio, RadioGroup, Text } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'

import css from './GorgiasChatCreationWizardStepBasics.less'

type LiveChatAvailabilitySettingsProps = {
    value:
        | typeof GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
        | typeof GORGIAS_CHAT_LIVE_CHAT_OFFLINE
    onChange: (
        value:
            | typeof GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
            | typeof GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
    ) => void
}

export const LiveChatAvailabilitySettings = ({
    value,
    onChange,
}: LiveChatAvailabilitySettingsProps) => {
    return (
        <div>
            <Text
                variant="bold"
                size="md"
                className={css.platformSelectionHeading}
            >
                Choose how to connect with customers
            </Text>
            <RadioGroup
                value={value}
                onChange={(newValue) => {
                    onChange(
                        newValue as
                            | typeof GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
                            | typeof GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
                    )
                }}
                flexDirection="column"
                gap="xs"
                marginBottom="md"
            >
                <Radio
                    value={
                        GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
                    }
                    label="Allow live chat messages"
                    caption="Creates live chat tickets when an agent is available during business hours."
                />
                <Radio
                    value={GORGIAS_CHAT_LIVE_CHAT_OFFLINE}
                    label="Allow only offline capture messages"
                    caption="Creates offline capture tickets that you can respond to by email at any moment."
                />
            </RadioGroup>
        </div>
    )
}
