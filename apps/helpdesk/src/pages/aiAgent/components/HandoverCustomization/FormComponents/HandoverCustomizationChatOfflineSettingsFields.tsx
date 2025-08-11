import cn from 'classnames'

import { LoadingSpinner, ToggleField } from '@gorgias/axiom'

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
                    label="Instructions"
                    className={`${css.offlineInstructionsTitle} mb-2`}
                >
                    Instructions
                </Label>
                <TextArea
                    id="handover-customization-offline-instructions"
                    rows={5}
                    name="handover-customization-offline-instructions"
                    aria-label="Offline instructions"
                    role="textbox"
                    maxLength={
                        formFieldsConfiguration.offlineInstructions.maxLength
                    }
                    placeholder="Apologize and acknowledge the issue."
                    onChange={onOfflineInstructionsChange}
                    value={values.offlineInstructions}
                    error={undefined}
                />
                <Caption className="caption-regular mt-1">
                    Write optional instructions for AI Agent to follow during
                    handover. By default, AI Agent generates a message using
                    your tone of voice.
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
