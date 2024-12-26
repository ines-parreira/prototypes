import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import React from 'react'

import Skeleton from 'react-loading-skeleton'

import aiAgentAvatarSrc from 'assets/img/ai-agent/ai-agent-avatar.png'
import Avatar from 'pages/common/components/Avatar/Avatar'

import Button from 'pages/common/components/button/Button'

import {ToneOfVoice} from '../constants'
import {CUSTOMER_LAST_NAME, CUSTOMER_NAME, TICKET_PREVIEW} from './constants'
import css from './TicketPreview.less'

type TicketPreviewProps = {
    toneOfVoice: ToneOfVoice | null
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
    isLoading?: boolean
    isError?: boolean
    isCustomToneOfVoice?: boolean
}
const CustomerMessage = ({
    customerName,
    customerLastName,
}: CustomerMessageProps) => {
    return (
        <div className={css.message}>
            <Avatar
                name={`${customerName} ${customerLastName}`}
                shape="square"
                size={36}
                className={classnames(css.avatar, css.banner)}
            />
            <div>
                <div className={css.header}>
                    {`${customerName} ${customerLastName}`}
                    <i className={classnames('material-icons', css.mailIcon)}>
                        mail
                    </i>
                </div>
                <div>What is your return policy?</div>
            </div>
        </div>
    )
}

const AIAgentMessage = ({
    greetings,
    message,
    signature,
    isLoading,
    isError,
}: AiAgentMessageProps) => {
    return (
        <div className={css.message}>
            <Avatar size={36} url={aiAgentAvatarSrc} className={css.banner} />
            <div className={css.content}>
                <div className={classnames(css.header, css.aiHeader)}>
                    AI Agent
                    <i className={classnames('material-icons', css.mailIcon)}>
                        mail
                    </i>
                </div>
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
    )
}

const AIAgentMessageSkeleton = () => (
    <div className={css.messageSkeleton}>
        {Array.from({length: 6}, (_, index) => (
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
            <div className={css.ticketPreview}>
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
                                        css.icon
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

            <div className={css.footer}>Ticket preview</div>
        </div>
    )
}
