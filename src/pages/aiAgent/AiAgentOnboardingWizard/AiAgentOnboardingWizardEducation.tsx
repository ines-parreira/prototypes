import React from 'react'

import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useCallbackRef from 'hooks/useCallbackRef'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import WizardFooter, {
    FOOTER_BUTTONS,
} from 'pages/common/components/wizard/WizardFooter'
import WizardStepSkeleton from 'pages/common/components/wizard/WizardStepSkeleton'

import {
    AI_AGENT_STEPS_DESCRIPTIONS,
    AI_AGENT_STEPS_LABELS,
    AI_AGENT_STEPS_TITLES,
    WIZARD_BUTTON_ACTIONS,
} from '../constants'
import { AiAgentOnboardingWizardProps } from './AiAgentOnboardingWizard'
import { useAiAgentOnboardingWizard } from './hooks/useAiAgentOnboardingWizard'

import css from './AiAgentOnboardingWizardEducation.less'

type Props = AiAgentOnboardingWizardProps

const AiAgentOnboardingWizardStepEducation: React.FC<Props> = () => {
    const [ref, setRef] = useCallbackRef()
    useInjectStyleToCandu(ref)

    const { handleSave, isLoading } = useAiAgentOnboardingWizard({
        step: AiAgentOnboardingWizardStep.Education,
    })

    const onFooterAction = (buttonClicked: FOOTER_BUTTONS) => {
        switch (buttonClicked) {
            case FOOTER_BUTTONS.CANCEL:
                handleSave({
                    redirectTo: WIZARD_BUTTON_ACTIONS.CANCEL,
                })
                break
            case FOOTER_BUTTONS.NEXT:
                handleSave({
                    redirectTo: WIZARD_BUTTON_ACTIONS.NEXT_STEP,
                    stepName: AiAgentOnboardingWizardStep.Personalize,
                })
                break
            default:
                break
        }
    }

    return (
        <>
            <WizardStepSkeleton
                step={AiAgentOnboardingWizardStep.Education}
                labels={AI_AGENT_STEPS_LABELS}
                titles={AI_AGENT_STEPS_TITLES}
                descriptions={AI_AGENT_STEPS_DESCRIPTIONS}
                footer={
                    <WizardFooter
                        displayNextButton
                        displayCancelButton
                        onClick={onFooterAction}
                        isDisabled={isLoading}
                    />
                }
                preview={
                    <div data-candu-id="ai-agent-onboarding-wizard-education-video" />
                }
                previewClassName={css.previewContainer}
            >
                <div
                    data-candu-id="ai-agent-onboarding-wizard-education"
                    ref={setRef}
                />
            </WizardStepSkeleton>
        </>
    )
}

export default AiAgentOnboardingWizardStepEducation
