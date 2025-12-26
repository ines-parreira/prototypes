import type React from 'react'

import type { Map } from 'immutable'

import { Button } from '@gorgias/axiom'

import { GorgiasChatCreationWizardSteps } from 'models/integration/types'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import { GorgiasChatCreationWizardStep } from '../../GorgiasChatCreationWizardStep'

import css from './GorgiasChatCreationWizardStepAutomate.less'

type Props = {
    integration: Map<any, any>
    isSubmitting: boolean
}

const GorgiasChatCreationWizardStepAutomate: React.FC<Props> = ({
    isSubmitting,
}) => {
    const { goToNextStep, goToPreviousStep } = useNavigateWizardSteps()

    return (
        <GorgiasChatCreationWizardStep
            step={GorgiasChatCreationWizardSteps.Automate}
            preview={'Preview placeholder'}
            footer={
                <>
                    <Button variant="tertiary" isDisabled={isSubmitting}>
                        Save &amp; Customize Later
                    </Button>
                    <div className={css.wizardButtons}>
                        <Button
                            variant="secondary"
                            onClick={goToPreviousStep}
                            isDisabled={isSubmitting}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => goToNextStep()}
                            isLoading={isSubmitting}
                        >
                            Next
                        </Button>
                    </div>
                </>
            }
        >
            <div className={css.placeholder}>
                <p>Automate step placeholder - to be implemented</p>
            </div>
        </GorgiasChatCreationWizardStep>
    )
}

export default GorgiasChatCreationWizardStepAutomate
