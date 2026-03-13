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

type Props = {
    liveChatAvailability: string
    onChange: (value: string) => void
}

export const ChatAvailabilityCard = ({
    liveChatAvailability,
    onChange,
}: Props) => {
    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.cardHeader}>
                    <Heading size="md">Chat availability</Heading>
                    <Text size="md">
                        Control when shoppers can start a live chat and what
                        happens outside business hours.
                    </Text>
                </div>

                <div className={css.radioGroupWrapper}>
                    <RadioGroup
                        value={liveChatAvailability}
                        onChange={onChange}
                        flexDirection="column"
                        gap="xs"
                    >
                        <Radio
                            value={
                                GORGIAS_CHAT_LIVE_CHAT_AUTO_BASED_ON_AGENT_AVAILABILITY
                            }
                            label="Live when agents are available"
                            caption="Customers can only send live chat messages when an agent is available in Gorgias."
                        />
                        <Radio
                            value={
                                GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
                            }
                            label="Always live during business hours"
                            caption="Customers can always send live chat messages during business hours."
                        />
                        <Radio
                            value={GORGIAS_CHAT_LIVE_CHAT_OFFLINE}
                            label="Offline (capture messages only)"
                            caption="Customers can only send messages using the offline capture."
                        />
                    </RadioGroup>
                </div>
            </div>
        </Card>
    )
}
