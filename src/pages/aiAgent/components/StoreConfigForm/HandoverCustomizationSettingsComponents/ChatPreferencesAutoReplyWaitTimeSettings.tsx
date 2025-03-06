import React from 'react'

import classnames from 'classnames'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
} from 'config/integrations/gorgias_chat'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import RadioFieldSet, {
    RadioFieldOption,
} from 'pages/common/forms/RadioFieldSet'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './ChatPreferencesAutoReplyWaitTimeSettings.less'

type Props = {
    isEnabled: boolean
    autoResponderReply: string
    onToggleEnablement: (enabled: boolean) => void
    onAutoResponderReplyChange: (reply: string) => void
}

const autoResponderOptions: RadioFieldOption[] = [
    {
        value: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
        label: (
            <>
                Dynamic wait time (recommended)
                <IconTooltip
                    className={css.icon}
                    tooltipProps={{
                        placement: 'top',
                        autohide: false,
                    }}
                >
                    {`Calculated based on your team's recent live chat
                    response times.`}{' '}
                    <a
                        href="https://docs.gorgias.com/en-US/109858-dc67e62b040a4649aed68bdce7ffa4f5"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </a>
                </IconTooltip>
            </>
        ),
    },
    {
        value: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
        label: 'In a few minutes',
    },
    {
        value: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
        label: 'In a few hours',
    },
]

const ChatPreferencesAutoReplyWaitTimeSettings = ({
    isEnabled,
    autoResponderReply,
    onToggleEnablement,
    onAutoResponderReplyChange,
}: Props) => {
    return (
        <div>
            <h4 className={classnames(css.title, 'mb-1')}>Wait time</h4>
            <p className="mb-4">
                Let customers know how fast they can expect a response from an
                agent.
            </p>
            <div className="mb-4 d-flex align-items-center">
                <ToggleInput
                    name="auto-reply-wait-time-toggle"
                    id="auto-reply-wait-time-toggle"
                    isToggled={isEnabled}
                    aria-label="Provide auto-reply wait time in the chat"
                    onClick={(value) => onToggleEnablement(value)}
                />
                <div className="ml-1">
                    <b>Send wait time</b>
                </div>
            </div>

            <div className="mb-3">
                <RadioFieldSet
                    className={classnames('mb-2', css.radioFieldSet)}
                    options={autoResponderOptions}
                    selectedValue={autoResponderReply}
                    onChange={(value) => onAutoResponderReplyChange(value)}
                    isDisabled={!isEnabled}
                />
            </div>
        </div>
    )
}

export default ChatPreferencesAutoReplyWaitTimeSettings
