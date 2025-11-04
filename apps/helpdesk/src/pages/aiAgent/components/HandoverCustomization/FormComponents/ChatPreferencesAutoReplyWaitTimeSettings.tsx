import { useCallback } from 'react'

import cn from 'classnames'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { GorgiasChatAutoResponderReply } from 'models/integration/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import RadioFieldSet, {
    RadioFieldOption,
} from 'pages/common/forms/RadioFieldSet'

import css from './ChatPreferencesAutoReplyWaitTimeSettings.less'

type Props = {
    isEnabled: boolean
    autoResponderReply: GorgiasChatAutoResponderReply | null
    onToggleEnablement: (enabled: boolean) => void
    onAutoResponderReplyChange: (reply: GorgiasChatAutoResponderReply) => void
}

const autoResponderOptions: RadioFieldOption[] = [
    {
        value: GorgiasChatAutoResponderReply.ReplyDynamic,
        label: (
            <>
                Dynamic wait time (recommended)
                <IconTooltip
                    className={cn(css.icon, css.tooltipIcon)}
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
        value: GorgiasChatAutoResponderReply.ReplyInMinutes,
        label: 'In a few minutes',
    },
    {
        value: GorgiasChatAutoResponderReply.ReplyInHours,
        label: 'In a few hours',
    },
]

const ChatPreferencesAutoReplyWaitTimeSettings = ({
    isEnabled,
    autoResponderReply,
    onToggleEnablement,
    onAutoResponderReplyChange,
}: Props) => {
    const onToggleChange = useCallback(
        (value: boolean) => onToggleEnablement(value),
        [onToggleEnablement],
    )

    const onReplyTypeChange = useCallback(
        (value: string) =>
            onAutoResponderReplyChange(value as GorgiasChatAutoResponderReply),
        [onAutoResponderReplyChange],
    )

    return (
        <div>
            <h4 className={cn(css.title, 'mb-1')}>Wait time</h4>
            <p className="mb-4">
                Let customers know how fast they can expect a response from an
                agent.
            </p>
            <div className="mb-4 d-flex align-items-center">
                <ToggleField
                    name="auto-reply-wait-time-toggle"
                    id="auto-reply-wait-time-toggle"
                    value={isEnabled}
                    aria-label="Provide auto-reply wait time in the chat"
                    onChange={onToggleChange}
                />
                <div className="ml-1">
                    <b>Send wait time</b>
                </div>
            </div>

            <div className="mb-3">
                <RadioFieldSet
                    className={cn('mb-2', css.radioFieldSet)}
                    options={autoResponderOptions}
                    selectedValue={autoResponderReply}
                    onChange={onReplyTypeChange}
                    isDisabled={!isEnabled}
                />
            </div>
        </div>
    )
}

export default ChatPreferencesAutoReplyWaitTimeSettings
