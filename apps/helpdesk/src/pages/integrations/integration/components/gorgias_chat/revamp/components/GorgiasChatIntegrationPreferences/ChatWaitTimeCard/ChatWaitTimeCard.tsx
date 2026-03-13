import {
    Card,
    Elevation,
    Heading,
    Radio,
    RadioGroup,
    Text,
    ToggleField,
} from '@gorgias/axiom'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
} from 'config/integrations/gorgias_chat'

import css from '../GorgiasChatIntegrationPreferences.less'

type Props = {
    autoResponderEnabled: boolean
    autoResponderReply: string
    onAutoResponderEnabledChange: (value: boolean) => void
    onAutoResponderReplyChange: (value: string) => void
}

export const ChatWaitTimeCard = ({
    autoResponderEnabled,
    autoResponderReply,
    onAutoResponderEnabledChange,
    onAutoResponderReplyChange,
}: Props) => {
    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.toggleHeader}>
                    <div className={css.cardHeader}>
                        <Heading size="md">
                            Share wait time with customers
                        </Heading>
                        <Text size="md">
                            Let customers know when to expect a reply while
                            waiting for your team.
                        </Text>
                    </div>
                    <ToggleField
                        value={autoResponderEnabled}
                        onChange={onAutoResponderEnabledChange}
                    />
                </div>

                <div className={css.radioGroupWrapper}>
                    <RadioGroup
                        value={autoResponderReply}
                        onChange={onAutoResponderReplyChange}
                        flexDirection="column"
                        gap="xs"
                    >
                        <Radio
                            value={GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC}
                            label="Dynamic wait time (recommended)"
                            caption="Calculated based on your team's recent live chat response times."
                            isDisabled={!autoResponderEnabled}
                        />
                        <Radio
                            value={GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES}
                            label="In a few minutes"
                            isDisabled={!autoResponderEnabled}
                        />
                        <Radio
                            value={GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS}
                            label="In a few hours"
                            isDisabled={!autoResponderEnabled}
                        />
                    </RadioGroup>
                </div>
            </div>
        </Card>
    )
}
