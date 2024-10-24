import {useCallback, useState} from 'react'

import {CancellationFlowStep} from '../constants'

const useCancellationFlowStepsStateMachine = () => {
    const [cancellationStep, setCancellationStep] =
        useState<CancellationFlowStep>(CancellationFlowStep.productFeaturesFOMO)
    const resetCancellationFlow = useCallback(
        () => setCancellationStep(CancellationFlowStep.productFeaturesFOMO),
        [setCancellationStep]
    )
    const switchToNextStep = () => {
        switch (cancellationStep) {
            case CancellationFlowStep.productFeaturesFOMO:
                setCancellationStep(CancellationFlowStep.cancellationReasons)
                break
            case CancellationFlowStep.cancellationReasons:
                setCancellationStep(CancellationFlowStep.churnMitigationOffer)
                break
            case CancellationFlowStep.churnMitigationOffer:
                setCancellationStep(CancellationFlowStep.cancellationSummary)
                break
        }
    }

    return {cancellationStep, switchToNextStep, resetCancellationFlow}
}

export default useCancellationFlowStepsStateMachine
