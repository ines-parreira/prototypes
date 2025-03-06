import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { Label } from 'gorgias-design-system/Input/Label'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'

import ChatPreferencesAutoReplyWaitTimeSettings from './ChatPreferencesAutoReplyWaitTimeSettings'
import ChatPreferencesEmailCaptureSettings from './ChatPreferencesEmailCaptureSettings'

import css from './HandoverCustomizationOnlineSettings.less'

/// TODO: The real implementation of the component actions will be done in the next PRs - For now, the actions are empty functions
const HandoverCustomizationOnlineSettings = () => {
    return (
        <div>
            <div className={css.onlineInstructionsContainer}>
                <Label
                    htmlFor="handover-customization-online-instructions"
                    label={'Online instructions'}
                    className={`${css.onlineInstructionsTitle} mb-2`}
                >
                    Instructions
                </Label>
                <TextArea
                    id="handover-customization-online-instructions"
                    rows={5}
                    name="handover-customization-online-instructions"
                    placeholder={`Apologize and acknowledge the issue. Tell the customer that you’re connecting them with someone.`}
                    role="textbox"
                    aria-label="Online instructions"
                    onChange={() => {}}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    Write optional instructions for AI Agent to follow during
                    handover. AI Agent will match your tone of voice. By
                    default, it sends a fixed message based on your settings:
                    ie.{' '}
                    <i>
                        “Thanks for reaching out! We will be with you in 5
                        minutes.”
                    </i>
                </Caption>
            </div>
            <Alert type={AlertType.Info} icon="info" className="mb-4">
                Changes to the settings below will be reflected in your{' '}
                <a
                    href="/app/settings/channels/gorgias_chat"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Chat preferences.
                </a>
            </Alert>
            <div className={css.emailCaptureSettingContainer}>
                <ChatPreferencesEmailCaptureSettings
                    isEnabled={true}
                    emailCaptureEnforcement="optional"
                    onToggleEnablement={() => {}}
                    onEmailCaptureEnforcementChange={() => {}}
                />
            </div>
            <div className={css.autoReplyWaitTimeSettingsContainer}>
                <ChatPreferencesAutoReplyWaitTimeSettings
                    isEnabled={true}
                    autoResponderReply="reply-dynamic"
                    onToggleEnablement={() => {}}
                    onAutoResponderReplyChange={() => {}}
                />
            </div>

            <section className="mb-0">
                <Button
                    type="submit"
                    color="primary"
                    className="mr-2"
                    size="small"
                    onClick={() => {}}
                >
                    Save Changes
                </Button>

                <Button
                    intent="secondary"
                    color="secondary"
                    size="small"
                    onClick={() => {}}
                >
                    Cancel
                </Button>
            </section>
        </div>
    )
}

export default HandoverCustomizationOnlineSettings
