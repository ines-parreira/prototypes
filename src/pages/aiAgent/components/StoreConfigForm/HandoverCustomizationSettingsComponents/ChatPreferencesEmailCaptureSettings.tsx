import classnames from 'classnames'

import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
} from 'config/integrations/gorgias_chat'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import RadioFieldSet, {
    RadioFieldOption,
} from 'pages/common/forms/RadioFieldSet'
import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './ChatPreferencesEmailCaptureSettings.less'

type Props = {
    isEnabled: boolean
    emailCaptureEnforcement: string
    onToggleEnablement: (enabled: boolean) => void
    onEmailCaptureEnforcementChange: (enforcement: string) => void
}

const emailCaptureOptions: RadioFieldOption[] = [
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
        label: 'Optional',
    },
    {
        value: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
        label: (
            <>
                Required
                <IconTooltip className={css.icon}>
                    Note: In case of handover, customers may exit the Chat
                    without providing the required email, leading to tickets
                    with no associated email address.
                </IconTooltip>
            </>
        ),
    },
]

const ChatPreferencesEmailCaptureSettings = ({
    isEnabled,
    emailCaptureEnforcement,
    onToggleEnablement,
    onEmailCaptureEnforcementChange,
}: Props) => {
    return (
        <div>
            <h4 className={classnames(css.title, 'mb-1')}>Email capture</h4>
            <p className="mb-4">
                Collect the customer’s email when AI Agent can’t respond and
                needs to handover to your team.
            </p>

            <div className="mb-4 d-flex align-items-center">
                <ToggleInput
                    isToggled={isEnabled}
                    id="email-capture-toggle"
                    aria-label="Enable email capture"
                    onClick={(value) => onToggleEnablement(value)}
                >
                    <b>Enable email capture</b>
                </ToggleInput>
            </div>

            <RadioFieldSet
                isDisabled={!isEnabled}
                options={emailCaptureOptions}
                selectedValue={emailCaptureEnforcement}
                onChange={(value) => onEmailCaptureEnforcementChange(value)}
            />
        </div>
    )
}

export default ChatPreferencesEmailCaptureSettings
