import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useEffect, useMemo, useRef, useState} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {AiAgentOnboardingWizardStep} from 'models/aiAgent/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'

import {ChatSettingsFormComponent} from '../components/StoreConfigForm/FormComponents/ChatSettingsFormComponent'
import {EmailFormComponent} from '../components/StoreConfigForm/FormComponents/EmailFormComponent'
import {SignatureFormComponent} from '../components/StoreConfigForm/FormComponents/SignatureFormComponent'
import {ToneOfVoiceFormComponent} from '../components/StoreConfigForm/FormComponents/ToneOfVoiceFormComponent'
import {
    AI_AGENT_STEPS_DESCRIPTIONS,
    AI_AGENT_STEPS_LABELS,
    AI_AGENT_STEPS_TITLES,
    AiAgentChannel,
    WIZARD_BUTTON_ACTIONS,
} from '../constants'
import {FormValues} from '../types'
import {AiAgentOnboardingWizardProps} from './AiAgentOnboardingWizard'
import css from './AiAgentOnboardingWizardPersonalize.less'
import {HeaderSection} from './HeaderSection'
import {useAiAgentOnboardingWizard} from './hooks/useAiAgentOnboardingWizard'
import {TicketPreview} from './TicketPreview'

type Props = AiAgentOnboardingWizardProps

const AiAgentOnboardingWizardStepPersonalize: React.FC<Props> = ({
    shopType,
    shopName,
}) => {
    const [isPristine, setIsPristine] = useState(true)
    const isAiAgentOnboardingWizardEducationalStep =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizardEducationalStep]

    const step = AiAgentOnboardingWizardStep.Personalize

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)
    const {
        updateValue,
        handleSave,
        handleAction,
        storeFormValues: formValues,
        handleFormUpdate,
        isLoading,
    } = useAiAgentOnboardingWizard({
        step,
    })

    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]

    const handleButtonClicks = (action: FOOTER_BUTTONS) => {
        if (action !== FOOTER_BUTTONS.CANCEL) {
            setIsPristine(true)
        }
        switch (action) {
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                handleSave({
                    stepName: step,
                    redirectTo: WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER,
                })
                break
            case FOOTER_BUTTONS.BACK:
                handleAction(WIZARD_BUTTON_ACTIONS.PREVIOUS_STEP)
                break
            case FOOTER_BUTTONS.NEXT:
                handleSave({
                    redirectTo: WIZARD_BUTTON_ACTIONS.NEXT_STEP,
                    stepName: AiAgentOnboardingWizardStep.Knowledge,
                })
                break
            case FOOTER_BUTTONS.CANCEL:
                handleAction(WIZARD_BUTTON_ACTIONS.CANCEL)
                break
        }
    }

    const initialValueForChat = useMemo(() => {
        return chatChannels && chatChannels.length === 1
            ? chatChannels[0].value.id
            : undefined
    }, [chatChannels])

    const setInitialValues = useRef(true)
    const isChatAvailable = useMemo(() => {
        return isAiAgentChatEnabled && chatChannels && chatChannels.length > 0
    }, [chatChannels, isAiAgentChatEnabled])

    useEffect(() => {
        if (
            formValues.wizard &&
            formValues.wizard.enabledChannels &&
            formValues.wizard.enabledChannels.length === 0 &&
            setInitialValues.current
        ) {
            const availableChannels = [AiAgentChannel.Email]

            if (isChatAvailable) {
                availableChannels.push(AiAgentChannel.Chat)
            }

            setInitialValues.current = false
            handleFormUpdate({
                wizard: {
                    ...formValues.wizard,
                    enabledChannels: availableChannels,
                },
            })
        }
    }, [chatChannels, formValues.wizard, handleFormUpdate, isChatAvailable])

    const isChannelEnabled = (chanel: AiAgentChannel) => {
        return (
            !!formValues.wizard?.enabledChannels?.length &&
            formValues.wizard?.enabledChannels?.length > 0 &&
            formValues.wizard?.enabledChannels.includes(chanel)
        )
    }

    const handleChannelsUpdate = (params: Partial<FormValues>) => {
        setIsPristine(false)
        setInitialValues.current = false
        handleFormUpdate(params)
    }

    return (
        <>
            <UnsavedChangesPrompt
                onSave={() =>
                    handleButtonClicks(FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER)
                }
                when={!isPristine && !isLoading}
            />
            <WizardStepSkeleton
                step={step}
                labels={AI_AGENT_STEPS_LABELS}
                titles={AI_AGENT_STEPS_TITLES}
                descriptions={AI_AGENT_STEPS_DESCRIPTIONS}
                footer={
                    <WizardFooter
                        displaySaveAndCustomizeLater={
                            !!isAiAgentOnboardingWizardEducationalStep
                        }
                        displayBackButton={
                            !!isAiAgentOnboardingWizardEducationalStep
                        }
                        displayCancelButton={
                            !isAiAgentOnboardingWizardEducationalStep
                        }
                        displayNextButton
                        onClick={handleButtonClicks}
                        isDisabled={isLoading}
                    />
                }
                preview={
                    <TicketPreview
                        toneOfVoice={formValues.toneOfVoice}
                        signature={formValues.signature}
                        customToneOfVoiceGuidance={
                            formValues.customToneOfVoiceGuidance
                        }
                    />
                }
            >
                <form>
                    <div>
                        <div className={css.subTitle}>General settings</div>
                        <ToneOfVoiceFormComponent
                            updateValue={updateValue}
                            toneOfVoice={formValues.toneOfVoice}
                            customToneOfVoiceGuidance={
                                formValues.customToneOfVoiceGuidance
                            }
                            hasChat={isChatAvailable}
                            setIsPristine={setIsPristine}
                        />

                        <SignatureFormComponent
                            signature={formValues.signature}
                            updateValue={updateValue}
                            setIsPristine={setIsPristine}
                        />
                    </div>
                    <div className={css.subTitle}>Connect channels</div>

                    {formValues?.wizard && (
                        <Accordion defaultExpandedItem="email">
                            {!!formValues.monitoredEmailIntegrations && (
                                <AccordionItem id="email">
                                    <AccordionHeader>
                                        <HeaderSection
                                            title={AiAgentChannel.Email}
                                            isValid={
                                                !!formValues.monitoredEmailIntegrations &&
                                                formValues
                                                    .monitoredEmailIntegrations
                                                    .length > 0
                                            }
                                            wizard={formValues.wizard}
                                            handleFormUpdate={
                                                handleChannelsUpdate
                                            }
                                        />
                                    </AccordionHeader>
                                    <AccordionBody>
                                        <EmailFormComponent
                                            monitoredEmailIntegrations={
                                                formValues.monitoredEmailIntegrations
                                            }
                                            updateValue={updateValue}
                                            isRequired={isChannelEnabled(
                                                AiAgentChannel.Email
                                            )}
                                            shouldPrefillValue={
                                                formValues.wizard
                                                    .enabledChannels?.length ===
                                                0
                                            }
                                            setIsPristine={setIsPristine}
                                        />
                                    </AccordionBody>
                                </AccordionItem>
                            )}

                            {isChatAvailable &&
                                !!formValues.monitoredChatIntegrations && (
                                    <AccordionItem id="chat">
                                        <AccordionHeader>
                                            <HeaderSection
                                                title={AiAgentChannel.Chat}
                                                isValid={
                                                    !!formValues.monitoredChatIntegrations &&
                                                    formValues
                                                        .monitoredChatIntegrations
                                                        ?.length > 0
                                                }
                                                wizard={formValues.wizard}
                                                handleFormUpdate={
                                                    handleChannelsUpdate
                                                }
                                            />
                                        </AccordionHeader>
                                        <AccordionBody>
                                            <ChatSettingsFormComponent
                                                monitoredChatIntegrations={
                                                    formValues.monitoredChatIntegrations
                                                }
                                                updateValue={updateValue}
                                                chatChannels={chatChannels}
                                                initialValue={
                                                    initialValueForChat
                                                }
                                                isRequired={isChannelEnabled(
                                                    AiAgentChannel.Chat
                                                )}
                                                shouldPrefillValue={
                                                    formValues.wizard
                                                        .enabledChannels
                                                        ?.length === 0
                                                }
                                                setIsPristine={setIsPristine}
                                            />
                                        </AccordionBody>
                                    </AccordionItem>
                                )}
                        </Accordion>
                    )}
                </form>
            </WizardStepSkeleton>
        </>
    )
}

export default AiAgentOnboardingWizardStepPersonalize
