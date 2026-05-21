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

import css from '../../GorgiasChatIntegrationPreferences.less'

type Props = {
    emailCaptureEnabled: boolean
    emailCaptureEnforcement: string
    onEmailCaptureEnabledChange: (value: boolean) => void
    onEmailCaptureEnforcementChange: (value: string) => void
    isAiAgentEnabled?: boolean
}

const content = {
    default: {
        title: 'Collect shopper emails',
        description: 'Grow your email list and send follow-up messages.',
        options: [
            {
                value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
                label: 'Optional',
            },
            {
                value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                label: 'Required',
                caption: 'Reduces incoming conversations by about 70%',
            },
        ],
    },
    aiAgent: {
        title: 'Collect shopper emails at handover',
        description:
            'When AI Agent hands over to your team, ask the shopper for their email so your team can follow up.',
        options: [
            {
                value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
                label: 'Optional',
                caption:
                    'Email is requested but skippable, a ticket opens in your helpdesk in all cases.',
            },
            {
                value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
                label: 'Required',
                caption:
                    'Email is required before the conversation can continue. The ticket stays closed until the email is provided.',
            },
        ],
    },
}

export const ChatEmailCaptureCard = ({
    emailCaptureEnabled,
    emailCaptureEnforcement,
    onEmailCaptureEnabledChange,
    onEmailCaptureEnforcementChange,
    isAiAgentEnabled = false,
}: Props) => {
    const { title, description, options } = isAiAgentEnabled
        ? content.aiAgent
        : content.default

    return (
        <Card className={css.card} elevation={Elevation.Mid}>
            <div className={css.cardContent}>
                <div className={css.toggleHeader}>
                    <div className={css.cardHeader}>
                        <Heading size="md">{title}</Heading>
                        <Text size="md" className={css.cardDescription}>
                            {description}
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
                        {options.map((option) => (
                            <Radio
                                key={option.value}
                                value={option.value}
                                label={option.label}
                                caption={option.caption}
                                isDisabled={!emailCaptureEnabled}
                            />
                        ))}
                    </RadioGroup>
                </div>
            </div>
        </Card>
    )
}
