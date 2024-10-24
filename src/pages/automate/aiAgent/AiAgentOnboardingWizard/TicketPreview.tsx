import classnames from 'classnames'
import React from 'react'

import aiAgentAvatarSrc from 'assets/img/ai-agent/ai-agent-avatar.png'
import Avatar from 'pages/common/components/Avatar/Avatar'

import {ToneOfVoice} from '../constants'
import {CUSTOMER_LAST_NAME, CUSTOMER_NAME, TICKET_PREVIEW} from './constants'
import css from './TicketPreview.less'

type TicketPreviewProps = {
    toneOfVoice: ToneOfVoice | null
    signature: string | null
    customToneOfVoiceGuidance?: string | null
}

type CustomerMessageProps = {
    customerName: string
    customerLastName: string
}

type AiAgentMessageProps = {
    greetings?: string
    message: JSX.Element
    signature?: string | null
    showMessage: boolean
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
    showMessage,
}: AiAgentMessageProps) => {
    return (
        <div className={css.message}>
            <Avatar size={36} url={aiAgentAvatarSrc} className={css.banner} />
            <div>
                <div className={classnames(css.header, css.aiHeader)}>
                    AI Agent
                    <i className={classnames('material-icons', css.mailIcon)}>
                        mail
                    </i>
                </div>
                <div>
                    <div>{greetings && `${greetings} ${CUSTOMER_NAME},`}</div>
                    <div>
                        {greetings && <br />}
                        {showMessage && (
                            <div>
                                {message}
                                <br />
                                <br />
                            </div>
                        )}
                    </div>
                    <div>{signature}</div>
                </div>
            </div>
        </div>
    )
}

export const TicketPreview = ({
    toneOfVoice,
    signature,
    customToneOfVoiceGuidance,
}: TicketPreviewProps) => {
    if (!toneOfVoice) return null
    const message = TICKET_PREVIEW[toneOfVoice]?.message
    const greetings = TICKET_PREVIEW[toneOfVoice]?.greetings
    const showMessage =
        toneOfVoice !== ToneOfVoice.Custom ||
        (!!customToneOfVoiceGuidance &&
            customToneOfVoiceGuidance.trim().length > 0)

    return (
        <div>
            <div className={css.ticketPreview}>
                <CustomerMessage
                    customerName={CUSTOMER_NAME}
                    customerLastName={CUSTOMER_LAST_NAME}
                />
                <AIAgentMessage
                    greetings={greetings}
                    message={message}
                    signature={signature}
                    showMessage={showMessage}
                />
            </div>

            <div className={css.footer}>Ticket preview</div>
        </div>
    )
}
