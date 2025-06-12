import classnames from 'classnames'

import { Avatar, Button, Skeleton, Tooltip } from '@gorgias/merchant-ui-kit'

import aiAgentAvatarSrc from 'assets/img/ai-agent/ai-agent-avatar.png'
import {
    CUSTOMER_LAST_NAME,
    CUSTOMER_NAME,
    TICKET_PREVIEW,
} from 'pages/aiAgent/AiAgentOnboardingWizard/constants'
import { ToneOfVoice } from 'pages/aiAgent/constants'

import css from './TicketPreview.less'

type TicketPreviewProps = {
    toneOfVoice: ToneOfVoice | null
    aiAgentName?: string
    signature: string | null
    customToneOfVoiceGuidance?: string | null
    customToneOfVoicePreview?: string | null
    onGenerateCustomToneOfVoicePreview?: () => void
    isLoadingCustomToneOfVoicePreview?: boolean
    isError?: boolean
}

type CustomerMessageProps = {
    customerName: string
    customerLastName: string
}

type AiAgentMessageProps = {
    greetings?: string
    message: JSX.Element
    signature?: string | null
    aiAgentName?: string | null
    isLoading?: boolean
    isError?: boolean
    isCustomToneOfVoice?: boolean
}

const CustomerMessage = ({
    customerName,
    customerLastName,
}: CustomerMessageProps) => {
    return (
        <div>
            <div className={css.message}>
                <div>What is your return policy?</div>
            </div>
            {customerName} {customerLastName}
        </div>
    )
}

const AIAgentMessage = ({
    greetings,
    message,
    signature,
    aiAgentName,
    isLoading,
    isError,
}: AiAgentMessageProps) => {
    return (
        <div className={css.aiMessageContainer}>
            <div className={css.aiMessage}>
                <div className={css.content}>
                    {isLoading ? (
                        <AIAgentMessageSkeleton />
                    ) : isError ? (
                        <AIAgentErrorMessage />
                    ) : (
                        <AIAgentGreetingMessage
                            greetings={greetings}
                            message={message}
                            signature={signature}
                        />
                    )}
                </div>
            </div>
            <div className={css.aiName}>
                <Avatar
                    size="xs"
                    url={aiAgentAvatarSrc}
                    name="AI Agent"
                    className={classnames(css.banner, css.avatar)}
                />
                {aiAgentName}
            </div>
        </div>
    )
}

const AIAgentMessageSkeleton = () => (
    <div className={css.messageSkeleton}>
        {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height={28} />
        ))}
    </div>
)

const AIAgentErrorMessage = () => (
    <div className={css.errorMessage}>
        <span className="body-semibold">Error: </span>
        <span>
            Preview could not be generated. Make sure instructions are not vague
            or contradictory and try again.
        </span>
    </div>
)

const AIAgentGreetingMessage = ({
    greetings,
    message,
    signature,
}: Partial<AiAgentMessageProps>) => (
    <div>
        <div>{greetings && `${greetings} ${CUSTOMER_NAME},`}</div>
        <div>
            {greetings && <br />}
            <div>
                {message}
                <br />
                <br />
            </div>
        </div>
        <div>{signature}</div>
    </div>
)
const AIAgentCustomToneOfVoiceMessage = ({
    customToneOfVoicePreview,
}: {
    customToneOfVoicePreview: string
}) => {
    return <div>{customToneOfVoicePreview}</div>
}

export const TicketPreview = ({
    toneOfVoice,
    signature,
    aiAgentName,
    customToneOfVoiceGuidance,
    customToneOfVoicePreview,
    onGenerateCustomToneOfVoicePreview,
    isLoadingCustomToneOfVoicePreview,
    isError,
}: TicketPreviewProps) => {
    if (!toneOfVoice) return null

    const message = TICKET_PREVIEW[toneOfVoice]?.message
    const greetings = TICKET_PREVIEW[toneOfVoice]?.greetings
    const isValidCustomToneOfVoice =
        !!customToneOfVoiceGuidance &&
        customToneOfVoiceGuidance.trim().length > 0

    const isCustomToneOfVoice = toneOfVoice === ToneOfVoice.Custom

    return (
        <div>
            <div className={css.caption}>
                Example of AI Agent&apos;s Tone of Voice
            </div>

            <div className={css.tovPreview}>
                <CustomerMessage
                    customerName={CUSTOMER_NAME}
                    customerLastName={CUSTOMER_LAST_NAME}
                />
                <AIAgentMessage
                    greetings={greetings}
                    message={
                        isCustomToneOfVoice && customToneOfVoicePreview ? (
                            <AIAgentCustomToneOfVoiceMessage
                                customToneOfVoicePreview={
                                    customToneOfVoicePreview
                                }
                            />
                        ) : (
                            message
                        )
                    }
                    aiAgentName={aiAgentName}
                    signature={signature}
                    isLoading={
                        isCustomToneOfVoice && isLoadingCustomToneOfVoicePreview
                    }
                    isError={isCustomToneOfVoice && isError}
                />
                {isCustomToneOfVoice && (
                    <>
                        <Button
                            id="generate-preview-button"
                            className={css.generatePreviewButton}
                            intent="secondary"
                            size="small"
                            onClick={onGenerateCustomToneOfVoicePreview}
                            isDisabled={
                                isLoadingCustomToneOfVoicePreview ||
                                !isValidCustomToneOfVoice
                            }
                            isLoading={isLoadingCustomToneOfVoicePreview}
                        >
                            {!isLoadingCustomToneOfVoicePreview && (
                                <i
                                    className={classnames(
                                        'material-icons',
                                        css.icon,
                                    )}
                                    aria-hidden="true"
                                >
                                    auto_awesome
                                </i>
                            )}
                            Generate preview
                        </Button>
                        <Tooltip
                            target="generate-preview-button"
                            placement="top"
                            disabled={isValidCustomToneOfVoice}
                        >
                            Tone of voice required to generate preview
                        </Tooltip>
                    </>
                )}
            </div>
        </div>
    )
}
