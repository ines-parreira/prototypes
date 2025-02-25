import { act, renderHook } from '@testing-library/react-hooks'

import { CancellationFlowStep } from '../../constants'
import useCancellationFlowStepsStateMachine from '../useCancellationFlowStepsStateMachine'

describe('useCancellationFlowStepsStateMachine', () => {
    it('returns the product features FOMO step initially', () => {
        const {
            result: {
                current: { cancellationStep },
            },
        } = renderHook(() => useCancellationFlowStepsStateMachine())
        expect(cancellationStep).toBe(CancellationFlowStep.productFeaturesFOMO)
    })

    it('should go through state machine and reset', () => {
        const { result } = renderHook(() =>
            useCancellationFlowStepsStateMachine(),
        )

        // Go through all the steps
        ;[
            CancellationFlowStep.cancellationReasons,
            CancellationFlowStep.churnMitigationOffer,
            CancellationFlowStep.cancellationSummary,
        ].forEach((step) => {
            const { switchToNextStep } = result.current
            act(() => {
                switchToNextStep()
            })

            const { cancellationStep } = result.current
            expect(cancellationStep).toBe(step)
        })

        // Reset to initial step
        const { resetCancellationFlow } = result.current
        act(() => {
            resetCancellationFlow()
        })

        const { cancellationStep } = result.current
        expect(cancellationStep).toBe(CancellationFlowStep.productFeaturesFOMO)
    })
})
