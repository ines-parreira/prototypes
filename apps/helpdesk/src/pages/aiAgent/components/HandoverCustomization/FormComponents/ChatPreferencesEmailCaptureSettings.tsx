import { useCallback } from 'react'

import cn from 'classnames'

import { ToggleField } from '@gorgias/axiom'

import { GorgiasChatEmailCaptureType } from 'models/integration/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import RadioFieldSet, {
    RadioFieldOption,
} from 'pages/common/forms/RadioFieldSet'

import css from './ChatPreferencesEmailCaptureSettings.less'

type Props = {
    isEnabled: boolean
    emailCaptureEnforcement?: GorgiasChatEmailCaptureType
    onToggleEnablement: (enabled: boolean) => void
    onEmailCaptureEnforcementChange: (
        enforcement: GorgiasChatEmailCaptureType,
    ) => void
}

const emailCaptureOptions: RadioFieldOption[] = [
    {
        value: GorgiasChatEmailCaptureType.Optional,
        label: 'Optional',
    },
    {
        value: GorgiasChatEmailCaptureType.AlwaysRequired,
        label: (
            <>
                Required
                <IconTooltip className={cn(css.icon, css.tooltipIcon)}>
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
    const onToggleChange = useCallback(
        (value: boolean) => onToggleEnablement(value),
        [onToggleEnablement],
    )

    const onEnforcementChange = useCallback(
        (value: string) =>
            onEmailCaptureEnforcementChange(
                value as GorgiasChatEmailCaptureType,
            ),
        [onEmailCaptureEnforcementChange],
    )

    return (
        <div>
            <h4 className={cn(css.title, 'mb-1')}>Email capture</h4>
            <p className="mb-4">
                Collect the customer’s email when AI Agent can’t respond and
                needs to handover to your team.
            </p>

            <div className="mb-4 d-flex align-items-center">
                <ToggleField
                    value={isEnabled}
                    id="email-capture-toggle"
                    aria-label="Enable email capture"
                    onChange={onToggleChange}
                    label={<b>Enable email capture</b>}
                />
            </div>

            <RadioFieldSet
                isDisabled={!isEnabled}
                options={emailCaptureOptions}
                selectedValue={emailCaptureEnforcement ?? null}
                onChange={onEnforcementChange}
            />
        </div>
    )
}

export default ChatPreferencesEmailCaptureSettings
