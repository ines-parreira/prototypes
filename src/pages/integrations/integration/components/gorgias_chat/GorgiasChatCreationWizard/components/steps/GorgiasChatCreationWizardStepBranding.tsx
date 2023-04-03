import React, {useState} from 'react'
import {Map, fromJS} from 'immutable'

import history from 'pages/history'

import useAppDispatch from 'hooks/useAppDispatch'

import {
    GORGIAS_CHAT_WIDGET_TEXTS,
    GORGIAS_CHAT_DEFAULT_COLOR,
} from 'config/integrations/gorgias_chat'

import {updateOrCreateIntegration} from 'state/integrations/actions'

import {
    GorgiasChatCreationWizardSteps,
    GorgiasChatLauncherType,
    IntegrationType,
} from 'models/integration/types'

import ColorField from 'pages/common/forms/ColorField'
import InputField from 'pages/common/forms/input/InputField'

import Button from 'pages/common/components/button/Button'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import ChatLauncher from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatLauncher'

import GorgiasChatCreationWizardStep from '../GorgiasChatCreationWizardStep'
import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'

import css from './GorgiasChatCreationWizardStepBranding.less'

type SubmitForm = {
    type: IntegrationType.GorgiasChat
    id: number
    decoration: Record<string, any>
}

type Props = {
    integration: Map<any, any>
    isSubmitting: boolean
}

const GorgiasChatCreationWizardStepBranding: React.FC<Props> = ({
    integration,
    isSubmitting,
}) => {
    const dispatch = useAppDispatch()

    const {goToNextStep, goToPreviousStep} = useNavigateWizardSteps()

    const [currentMainColor, setCurrentMainColor] = useState<string>()
    const [currentConversationColor, setCurrentConversationColor] =
        useState<string>()

    const [currentLauncherType, setCurrentLauncherType] =
        useState<GorgiasChatLauncherType>()
    const [currentLauncherLabel, setCurrentLauncherLabel] = useState<string>()

    const mainColor =
        currentMainColor ||
        (integration.getIn(
            ['decoration', 'main_color'],
            GORGIAS_CHAT_DEFAULT_COLOR
        ) as string)

    const conversationColor =
        currentConversationColor ||
        (integration.getIn(
            ['decoration', 'conversation_color'],
            GORGIAS_CHAT_DEFAULT_COLOR
        ) as string)

    const language = integration.getIn(['meta', 'language']) as string

    const launcherLabel =
        currentLauncherLabel !== undefined
            ? currentLauncherLabel
            : GORGIAS_CHAT_WIDGET_TEXTS[language]?.chatWithUs

    const launcherType =
        currentLauncherType ||
        (integration.getIn(
            ['decoration', 'launcher', 'type'],
            GorgiasChatLauncherType.ICON
        ) as GorgiasChatLauncherType)

    const onSave = (shouldGoToNextStep = true) => {
        if (
            shouldGoToNextStep &&
            currentMainColor === undefined &&
            currentConversationColor === undefined &&
            currentLauncherLabel === undefined &&
            currentLauncherType === undefined
        ) {
            goToNextStep()
            return Promise.resolve()
        }

        const form: SubmitForm = {
            type: IntegrationType.GorgiasChat,
            id: integration.get('id'),
            decoration: (integration.get('decoration') as Map<any, any>)
                .set('conversation_color', conversationColor)
                .set('main_color', mainColor)
                .toJS(),
        }

        if (launcherType === GorgiasChatLauncherType.ICON_AND_LABEL) {
            form.decoration.launcher = {
                type: GorgiasChatLauncherType.ICON_AND_LABEL,
                label: launcherLabel,
            }
        } else if (launcherType === GorgiasChatLauncherType.ICON) {
            form.decoration.launcher = {
                type: GorgiasChatLauncherType.ICON,
            }
        }

        return dispatch(
            updateOrCreateIntegration(fromJS(form), undefined, true, () => {
                shouldGoToNextStep && goToNextStep()
            })
        )
    }

    return (
        <GorgiasChatCreationWizardStep
            step={GorgiasChatCreationWizardSteps.Branding}
            preview={
                <GorgiasChatCreationWizardPreview
                    integration={integration}
                    mainColor={currentMainColor}
                    conversationColor={currentConversationColor}
                />
            }
            footer={
                <>
                    <Button
                        fillStyle="ghost"
                        onClick={() =>
                            onSave().then(() => {
                                history.push(
                                    '/app/settings/channels/gorgias_chat'
                                )
                            })
                        }
                        isDisabled={isSubmitting}
                    >
                        Save &amp; Customize Later
                    </Button>
                    <div className={css.wizardButtons}>
                        <Button
                            intent="secondary"
                            onClick={goToPreviousStep}
                            isDisabled={isSubmitting}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => onSave(true)}
                            isLoading={isSubmitting}
                        >
                            Next
                        </Button>
                    </div>
                </>
            }
        >
            <>
                <div className={css.section}>
                    <div className={css.sectionHeading}>Colors</div>
                    <div className={css.colorPickerGroup}>
                        <ColorField
                            className={css.colorPicker}
                            value={mainColor}
                            onChange={setCurrentMainColor}
                            label="Main color"
                        />

                        <ColorField
                            className={css.colorPicker}
                            value={conversationColor}
                            onChange={setCurrentConversationColor}
                            label="Conversation color"
                        />
                    </div>
                </div>
                <div className={css.section}>
                    <div className={css.sectionHeading}>Launcher</div>
                    <div className={css.radioButtonGroup}>
                        <PreviewRadioButton
                            isSelected={
                                launcherType === GorgiasChatLauncherType.ICON
                            }
                            label="Icon"
                            preview={
                                <div className={css.launcherPreview}>
                                    <ChatLauncher
                                        type={GorgiasChatLauncherType.ICON}
                                        backgroundColor={currentMainColor}
                                        windowState="closed"
                                    />
                                </div>
                            }
                            value={GorgiasChatLauncherType.ICON}
                            onClick={() =>
                                setCurrentLauncherType(
                                    GorgiasChatLauncherType.ICON
                                )
                            }
                        />

                        <PreviewRadioButton
                            isSelected={
                                launcherType ===
                                GorgiasChatLauncherType.ICON_AND_LABEL
                            }
                            label="Icon and label"
                            preview={
                                <div className={css.launcherPreview}>
                                    <ChatLauncher
                                        type={
                                            GorgiasChatLauncherType.ICON_AND_LABEL
                                        }
                                        backgroundColor={currentMainColor}
                                        label={launcherLabel}
                                        windowState="closed"
                                    />
                                </div>
                            }
                            value={GorgiasChatLauncherType.ICON_AND_LABEL}
                            onClick={() =>
                                setCurrentLauncherType(
                                    GorgiasChatLauncherType.ICON_AND_LABEL
                                )
                            }
                        />
                    </div>
                    {launcherType ===
                        GorgiasChatLauncherType.ICON_AND_LABEL && (
                        <div className={css.launcherSettingsGrid}>
                            <InputField
                                type="text"
                                label="Label"
                                value={launcherLabel}
                                onChange={setCurrentLauncherLabel}
                                isRequired
                                maxLength={20}
                                caption={`${
                                    launcherLabel?.length || 0
                                }/20 characters`}
                            />
                        </div>
                    )}
                </div>
            </>
        </GorgiasChatCreationWizardStep>
    )
}

export default GorgiasChatCreationWizardStepBranding
