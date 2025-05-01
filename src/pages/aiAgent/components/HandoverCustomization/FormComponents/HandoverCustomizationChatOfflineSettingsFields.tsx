import cn from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { LoadingSpinner, ToggleField } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { Label } from 'gorgias-design-system/Input/Label'
import { HandoverCustomizationChatOfflineSettingsFormValues } from 'pages/aiAgent/types'
import { formFieldsConfiguration } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOfflineSettingsForm.utils'
import Caption from 'pages/common/forms/Caption/Caption'
import TextArea from 'pages/common/forms/TextArea'

import commonCss from './HandoverCommonSettings.less'
import css from './HandoverCustomizationChatOfflineSettings.less'

export const HandoverCustomizationChatOfflineSettingsFields = ({
    onOfflineInstructionsChange,
    onBusinessHoursChange,
    values,
    isLoading,
}: {
    values: HandoverCustomizationChatOfflineSettingsFormValues
    onOfflineInstructionsChange: (nextValue: string) => void
    onBusinessHoursChange: (
        nextValue: boolean,
        event: React.MouseEvent<HTMLLabelElement>,
    ) => void
    isLoading: boolean
}) => {
    const isSettingsRevampEnabled =
        useFlags()[FeatureFlagKey.AiAgentSettingsRevamp]

    if (isLoading) {
        return (
            <div
                className={cn(css.spinner, css.loadingContainer)}
                aria-busy="true"
                aria-label="Loading"
            >
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <div className={commonCss.formContainer}>
            <div
                className={cn(
                    commonCss.sectionContainer,
                    css.offlineInstructionsContainer,
                )}
            >
                <Label
                    htmlFor="handover-customization-offline-instructions"
                    label={
                        isSettingsRevampEnabled ? 'Instructions' : 'Guidance'
                    }
                    className={`${css.offlineInstructionsTitle} mb-2`}
                >
                    {isSettingsRevampEnabled ? 'Instructions' : 'Guidance'}
                </Label>
                <TextArea
                    id="handover-customization-offline-instructions"
                    rows={5}
                    name="handover-customization-offline-instructions"
                    aria-label={
                        isSettingsRevampEnabled
                            ? 'Offline instructions'
                            : 'Guidance'
                    }
                    role="textbox"
                    maxLength={
                        formFieldsConfiguration.offlineInstructions.maxLength
                    }
                    placeholder={
                        isSettingsRevampEnabled
                            ? `Apologize and acknowledge the issue.`
                            : "Apologize and acknowledge the issue. Request the customers' email address for our team to reach back."
                    }
                    onChange={onOfflineInstructionsChange}
                    value={values.offlineInstructions}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    {isSettingsRevampEnabled
                        ? `Write optional instructions for AI Agent to follow during handover.
          By default, AI Agent generates a message using your tone of voice.`
                        : `AI Agent will use these instructions to craft the handover message it sends to customers. If left blank, it will generate a generic message using your tone of voice.`}
                </Caption>
            </div>

            <div className="d-flex align-items-center">
                <ToggleField
                    value={values.shareBusinessHours}
                    name="share-business-hours-toggle"
                    id="share-business-hours-toggle"
                    aria-label="Share business hours in handover message"
                    onChange={onBusinessHoursChange}
                />

                <span className="body-semibold">
                    Share business hours in handover message
                </span>
                <a
                    href="/app/settings/business-hours"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(css.link, css.businessHoursLink)}
                >
                    View Business Hours
                </a>
            </div>
        </div>
    )
}
