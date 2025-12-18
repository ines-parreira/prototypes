import type React from 'react'

import { history } from '@repo/routing'
import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { GorgiasChatCreationWizardSteps } from 'models/integration/types/gorgiasChat'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'

import { GorgiasChatCreationWizardStep } from '../../GorgiasChatCreationWizardStep'

type Props = {
    isUpdate: boolean
    isSubmitting: boolean
}

const GorgiasChatCreationWizardStepBasics: React.FC<Props> = ({
    isUpdate,
    isSubmitting,
}) => {
    const navigateWizardSteps = useNavigateWizardSteps()

    const handleNext = () => {
        navigateWizardSteps.goToNextStep()
    }

    return (
        <GorgiasChatCreationWizardStep
            step={GorgiasChatCreationWizardSteps.Basics}
            preview={<div>Preview placeholder</div>}
            footer={
                <>
                    {isUpdate ? (
                        <Button
                            onClick={() => {
                                history.push(
                                    '/app/settings/channels/gorgias_chat',
                                )
                            }}
                            isDisabled={isSubmitting}
                        >
                            Save &amp; Customize Later
                        </Button>
                    ) : (
                        <Link to="/app/settings/channels/gorgias_chat">
                            <Button
                                variant="secondary"
                                isDisabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="primary"
                        onClick={handleNext}
                        isLoading={isSubmitting}
                    >
                        {isUpdate ? 'Next' : 'Create & Customize'}
                    </Button>
                </>
            }
        >
            <div>
                <p>Basics step placeholder content</p>
            </div>
        </GorgiasChatCreationWizardStep>
    )
}

export default GorgiasChatCreationWizardStepBasics
