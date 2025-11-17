import type React from 'react'
import { useMemo, useRef, useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'

import {
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import Launcher from 'gorgias-design-system/Launcher/Launcher'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    GorgiasChatCreationWizardSteps,
    GorgiasChatLauncherType,
    IntegrationType,
} from 'models/integration/types'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import ColorField from 'pages/common/forms/ColorField'
import InputField from 'pages/common/forms/input/InputField'
import { useOnClickOutside } from 'pages/common/hooks/useOnClickOutside'
import { updateOrCreateIntegration } from 'state/integrations/actions'

import useLogWizardEvent from '../../hooks/useLogWizardEvent'
import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'
import GorgiasChatCreationWizardStep from '../GorgiasChatCreationWizardStep'

import css from './GorgiasChatCreationWizardStepBranding.less'

type SubmitForm = {
    type: IntegrationType.GorgiasChat
    id: number
    decoration: Record<string, any>
    meta: Record<string, any>
}

type Props = {
    integration: Map<any, any>
    isSubmitting: boolean
}

const GorgiasChatCreationWizardStepBranding: React.FC<Props> = ({
    integration,
    isSubmitting,
}) => {
    const logWizardEvent = useLogWizardEvent()

    const dispatch = useAppDispatch()

    const launcherCustomizationRef = useRef<HTMLDivElement>(null)

    const [isChatOpenInPreview, setIsChatOpenInPreview] = useState(true)
    useOnClickOutside(launcherCustomizationRef, () => {
        setIsChatOpenInPreview(true)
    })

    const { goToNextStep, goToPreviousStep } = useNavigateWizardSteps()

    const [hasSubmitted, setHasSubmitted] = useState(false)

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
            GORGIAS_CHAT_DEFAULT_COLOR,
        ) as string)

    const conversationColor =
        currentConversationColor ||
        (integration.getIn(
            ['decoration', 'conversation_color'],
            GORGIAS_CHAT_DEFAULT_COLOR,
        ) as string)

    const language = integration.getIn(['meta', 'language']) as string

    const launcherLabel: string =
        currentLauncherLabel ??
        integration.getIn(
            ['decoration', 'launcher', 'label'],
            GORGIAS_CHAT_WIDGET_TEXTS[language]?.chatWithUs,
        )

    const launcherType =
        currentLauncherType ||
        (integration.getIn(
            ['decoration', 'launcher', 'type'],
            GorgiasChatLauncherType.ICON,
        ) as GorgiasChatLauncherType)

    const isPristine =
        currentMainColor === undefined &&
        currentConversationColor === undefined &&
        currentLauncherLabel === undefined &&
        currentLauncherType === undefined

    const onSave = (shouldGoToNextStep = false, isContinueLater = false) => {
        const form: SubmitForm = {
            type: IntegrationType.GorgiasChat,
            id: integration.get('id'),
            decoration: (integration.get('decoration') as Map<any, any>)
                .set('conversation_color', conversationColor)
                .set('main_color', mainColor)
                .toJS(),
            meta: (integration.get('meta') as Map<any, any>)
                .setIn(
                    ['wizard', 'step'],
                    shouldGoToNextStep
                        ? GorgiasChatCreationWizardSteps.Automate
                        : GorgiasChatCreationWizardSteps.Branding,
                )
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
            updateOrCreateIntegration(
                fromJS(form),
                undefined,
                true,
                () => {
                    logWizardEvent(
                        isContinueLater
                            ? SegmentEvent.ChatWidgetWizardSaveLaterClicked
                            : SegmentEvent.ChatWidgetWizardStepCompleted,
                        {
                            launcher_type: launcherType,
                        },
                    )

                    setHasSubmitted(true)
                    shouldGoToNextStep && goToNextStep()
                },
                shouldGoToNextStep,
                'Changes saved',
            ),
        )
    }

    const launcher = useMemo(
        () => ({
            type: launcherType,
            label: launcherLabel,
        }),
        [launcherLabel, launcherType],
    )

    return (
        <>
            <UnsavedChangesPrompt
                onSave={() => onSave()}
                when={!isPristine && !hasSubmitted}
                shouldRedirectAfterSave
            />
            <GorgiasChatCreationWizardStep
                step={GorgiasChatCreationWizardSteps.Branding}
                preview={
                    <GorgiasChatCreationWizardPreview
                        integration={integration}
                        mainColor={currentMainColor}
                        conversationColor={currentConversationColor}
                        launcher={launcher}
                        isOpen={isChatOpenInPreview}
                    />
                }
                footer={
                    <>
                        <Button
                            fillStyle="ghost"
                            onClick={() =>
                                onSave(false, true).then(() => {
                                    history.push(
                                        '/app/settings/channels/gorgias_chat',
                                    )
                                })
                            }
                            isDisabled={isSubmitting}
                        >
                            Save &amp; Customize Later
                        </Button>
                        <div className={css.wizardButtons}>
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
                        <div
                            className={css.radioButtonGroup}
                            ref={launcherCustomizationRef}
                        >
                            <PreviewRadioButton
                                isSelected={
                                    launcherType ===
                                    GorgiasChatLauncherType.ICON
                                }
                                label="Icon"
                                preview={
                                    <div className={css.launcherPreview}>
                                        <Launcher
                                            fillColor={mainColor}
                                            shouldHideLabel
                                        />
                                    </div>
                                }
                                value={GorgiasChatLauncherType.ICON}
                                onClick={() => {
                                    setCurrentLauncherType(
                                        GorgiasChatLauncherType.ICON,
                                    )
                                    setIsChatOpenInPreview(false)
                                }}
                            />

                            <PreviewRadioButton
                                isSelected={
                                    launcherType ===
                                    GorgiasChatLauncherType.ICON_AND_LABEL
                                }
                                label="Icon and label"
                                preview={
                                    <div
                                        className={css.launcherPreview}
                                        style={{
                                            fontFamily:
                                                GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
                                        }}
                                    >
                                        <Launcher
                                            fillColor={mainColor}
                                            shouldHideLabel={false}
                                            label={launcherLabel}
                                        />
                                    </div>
                                }
                                value={GorgiasChatLauncherType.ICON_AND_LABEL}
                                onClick={() => {
                                    setCurrentLauncherType(
                                        GorgiasChatLauncherType.ICON_AND_LABEL,
                                    )
                                    setIsChatOpenInPreview(false)
                                }}
                            />
                        </div>
                        {launcherType ===
                            GorgiasChatLauncherType.ICON_AND_LABEL && (
                            <div className={css.launcherSettingsGrid}>
                                <InputField
                                    type="text"
                                    label="Label"
                                    value={launcherLabel}
                                    onFocus={() => {
                                        setIsChatOpenInPreview(false)
                                    }}
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
        </>
    )
}

export default GorgiasChatCreationWizardStepBranding
