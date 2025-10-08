import { Button } from '@gorgias/axiom'

import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import VoiceFormSubmitButton from '../VoiceFormSubmitButton'
import RoutingTemplateRadioFieldSet from './RoutingTemplateRadioFieldSet'
import VoiceIntegrationOnboardingCancelButton from './VoiceIntegrationOnboardingCancelButton'

import css from './VoiceIntegrationOnboardingStep.less'

export default function ConfigureRoutingBehaviorStep() {
    const { goToPreviousStep } = useNavigateWizardSteps()

    return (
        <>
            <div className={css.container}>
                <div className={css.formContainer}>
                    <div>
                        <div className={css.header}>
                            Configure routing behavior
                        </div>
                        <div className={css.headerDescription}>
                            Choose a routing option to get started. You can
                            customize your call routing settings later in the
                            visual flow builder.
                        </div>
                    </div>
                    <RoutingTemplateRadioFieldSet />
                </div>
            </div>
            <div className={css.buttons}>
                <VoiceIntegrationOnboardingCancelButton />
                <div className={css.navigationButtons}>
                    <Button intent="secondary" onClick={goToPreviousStep}>
                        Back
                    </Button>
                    <VoiceFormSubmitButton>
                        Create voice integration
                    </VoiceFormSubmitButton>
                </div>
            </div>
        </>
    )
}
