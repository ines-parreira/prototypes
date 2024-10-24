import {Label} from '@gorgias/ui-kit'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useCallback, useEffect, useMemo, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    AiAgentOnboardingWizardStep,
    AiAgentOnboardingWizardType,
} from 'models/aiAgent/types'
import HelpCenterSelect, {
    EMPTY_HELP_CENTER_ID,
} from 'pages/automate/common/components/HelpCenterSelect'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'

import {CreatePublicSourcesSection} from '../components/StoreConfigForm/StoreConfigForm'
import {
    AI_AGENT_STEPS_DESCRIPTIONS,
    AI_AGENT_STEPS_LABELS,
    AI_AGENT_STEPS_TITLES,
    WIZARD_BUTTON_ACTIONS,
    WizardPostCompletionPathway,
} from '../constants'
import {AiAgentOnboardingWizardProps} from './AiAgentOnboardingWizard'
import css from './AiAgentOnboardingWizardKnowledge.less'
import {useAiAgentOnboardingWizard} from './hooks/useAiAgentOnboardingWizard'

type Props = AiAgentOnboardingWizardProps

const AiAgentOnboardingWizardStepKnowledge = ({shopName}: Props) => {
    const [publicUrls, setPublicUrls] = useState<string[]>([])
    const [pendingUrlCount, setPendingUrlCount] = useState(0)
    const [isPristine, setIsPristine] = useState(true)
    const [isPublicUrlsPristine, setIsPublicUrlsPristine] = useState(true)
    const [synchingPublicUrls, setSynchingPublicUrls] = useState(false)

    const isAiAgentOnboardingWizardKnowledgeRedirectEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizardKnowledgeRedirect]

    const {
        storeFormValues,
        faqHelpCenters,
        snippetHelpCenter,
        handleFormUpdate,
        handleAction,
        handleSave,
        isLoading,
        isUpdateWizardSetup,
        storeConfiguration,
    } = useAiAgentOnboardingWizard({
        step: AiAgentOnboardingWizardStep.Knowledge,
    })

    useEffect(() => {
        // prefills Help Center if it's a new setup and there's only one Help Center available
        if (
            storeConfiguration?.helpCenterId === null &&
            faqHelpCenters.length === 1 &&
            !isUpdateWizardSetup
        ) {
            handleFormUpdate({helpCenterId: faqHelpCenters[0].id})
        }

        // Trigger effect on storeConfiguration change to update values after fetching store configuration
    }, [
        faqHelpCenters,
        handleFormUpdate,
        isUpdateWizardSetup,
        storeConfiguration,
    ])

    const selectedHelpCenter = faqHelpCenters.find(
        (helpCenter) => helpCenter.id === storeFormValues.helpCenterId
    )

    const handleHelpCenterChange = (helpCenterId: number) => {
        setIsPristine(false)
        handleFormUpdate({
            helpCenterId:
                helpCenterId === EMPTY_HELP_CENTER_ID ? null : helpCenterId,
        })
    }

    const handlePublicURLsChange = useCallback((publicURLs: string[]) => {
        setPublicUrls(publicURLs)

        // Because it's possible to delete public URLs without saving the form,
        // if in the future there is a possibility to enable AI Agent during Onboarding steps,
        // we should deactivate AI Agent when there's no knowledge base
    }, [])

    const hasPublicUrlSynced = useMemo(
        () =>
            !selectedHelpCenter &&
            !!publicUrls.length &&
            publicUrls.length === pendingUrlCount,
        [pendingUrlCount, publicUrls.length, selectedHelpCenter]
    )

    const onFooterAction = (buttonClicked: string) => {
        setIsPristine(true)
        switch (buttonClicked) {
            case FOOTER_BUTTONS.BACK:
                handleAction(WIZARD_BUTTON_ACTIONS.PREVIOUS_STEP)
                break
            case FOOTER_BUTTONS.FINISH: {
                let onCompletePathway = null
                let redirectTo

                if (hasPublicUrlSynced) {
                    redirectTo = WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE
                    onCompletePathway = WizardPostCompletionPathway.knowledge
                } else if (isAiAgentOnboardingWizardKnowledgeRedirectEnabled) {
                    redirectTo = WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE
                    onCompletePathway = WizardPostCompletionPathway.guidance
                } else {
                    redirectTo = WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST
                    onCompletePathway = WizardPostCompletionPathway.test
                }

                handleSave({
                    publicUrls,
                    redirectTo,
                    payload: {
                        wizard: storeFormValues.wizard && {
                            ...storeFormValues.wizard,
                            completedDatetime: new Date().toISOString(),
                            onCompletePathway,
                        },
                    },
                })
                break
            }
            case FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER:
                handleSave({
                    publicUrls,
                    redirectTo: WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER,
                })
                break
            default:
                break
        }
    }

    const logConnectedPublicUrl = (url: string) => {
        logEvent(SegmentEvent.AiAgentOnboardingWizardPublicUrlIngested, {
            step: AiAgentOnboardingWizardStep.Knowledge,
            version: storeFormValues.wizard?.hasEducationStepEnabled
                ? AiAgentOnboardingWizardType.ThreeSteps
                : AiAgentOnboardingWizardType.TwoSteps,
            url,
        })
    }

    return (
        <>
            <UnsavedChangesPrompt
                onSave={() => {
                    if (!isPublicUrlsPristine) {
                        setSynchingPublicUrls(true)
                    }
                    if (!isPristine) {
                        onFooterAction(FOOTER_BUTTONS.SAVE_AND_CUSTOMIZE_LATER)
                    }
                }}
                when={(!isPristine || !isPublicUrlsPristine) && !isLoading}
            />
            <WizardStepSkeleton
                step={AiAgentOnboardingWizardStep.Knowledge}
                labels={AI_AGENT_STEPS_LABELS}
                titles={AI_AGENT_STEPS_TITLES}
                descriptions={AI_AGENT_STEPS_DESCRIPTIONS}
                footer={
                    <WizardFooter
                        displaySaveAndCustomizeLater
                        displayBackButton
                        displayFinishButton
                        onClick={onFooterAction}
                        isDisabled={isLoading}
                    />
                }
            >
                <div className={css.section}>
                    <Label className={css.label}>Help Center</Label>
                    <HelpCenterSelect
                        className={css.helpCenterSelect}
                        helpCenter={selectedHelpCenter}
                        setHelpCenterId={handleHelpCenterChange}
                        helpCenters={faqHelpCenters}
                        withEmptyItemSelection
                    />
                    <div className={css.caption}>
                        Select a Help Center to connect to AI Agent.
                    </div>
                </div>

                {snippetHelpCenter ? (
                    <CreatePublicSourcesSection
                        helpCenterId={snippetHelpCenter.id}
                        selectedHelpCenterId={selectedHelpCenter?.id}
                        onPublicURLsChanged={handlePublicURLsChange}
                        shopName={shopName}
                        logConnectedPublicUrl={logConnectedPublicUrl}
                        setPendingResourcesCount={setPendingUrlCount}
                        setIsPristine={setIsPublicUrlsPristine}
                        syncUrlOnCommand={synchingPublicUrls}
                        setSyncUrlOnCommand={setSynchingPublicUrls}
                    />
                ) : null}
            </WizardStepSkeleton>
        </>
    )
}

export default AiAgentOnboardingWizardStepKnowledge
