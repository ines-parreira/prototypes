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
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
} from 'config/integrations/gorgias_chat'

import css from '../GorgiasChatIntegrationPreferences.less'

type Props = {
    emailCaptureEnabled: boolean
    emailCaptureEnforcement: string
    onEmailCaptureEnabledChange: (value: boolean) => void
    onEmailCaptureEnforcementChange: (value: string) => void
}

export const ChatEmailCaptureCard = ({
    emailCaptureEnabled,
    emailCaptureEnforcement,
    onEmailCaptureEnabledChange,
    onEmailCaptureEnforcementChange,
}: Props) => {
    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.toggleHeader}>
                    <div className={css.cardHeader}>
                        <Heading size="md">Collect customer emails</Heading>
                        <Text size="md">
                            Grow your email list and send follow-up messages.
                        </Text>
                    </div>
                    <ToggleField
                        value={emailCaptureEnabled}
                        onChange={onEmailCaptureEnabledChange}
                    />
                </div>

                <div className={css.radioGroupWrapper}>
                    <RadioGroup
                        value={emailCaptureEnforcement}
                        onChange={onEmailCaptureEnforcementChange}
                        flexDirection="column"
                        gap="xs"
                    >
                        <Radio
                            value={GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL}
                            label="Optional"
                            isDisabled={!emailCaptureEnabled}
                        />
                        <Radio
                            value={
                                GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED
                            }
                            label="Required"
                            caption="Reduces incoming conversations by ~70%"
                            isDisabled={!emailCaptureEnabled}
                        />
                    </RadioGroup>
                </div>
            </div>
        </Card>
    )
}
