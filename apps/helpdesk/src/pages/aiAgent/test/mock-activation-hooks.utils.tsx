import { assumeMock } from '@repo/testing'

import { useActivation } from '../Activation/hooks/useActivation'

jest.mock('pages/aiAgent/Activation/hooks/useActivation')

export const applyMockActivationHook = () => {
    const mockUseActivation = assumeMock(useActivation)
    mockUseActivation.mockReturnValue({
        showActivationModal: () => {},
        showEarlyAccessModal: () => {},
        isOnNewPlan: false,
        activationButton: <div>ActivationButton</div>,
        activationModal: <div>ActivationModal</div>,
        earlyAccessModal: <div>EarlyAccessModal</div>,
        onUpgradePlanClick: () => Promise.resolve(),
    })
}

applyMockActivationHook()
