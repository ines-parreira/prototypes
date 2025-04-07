import { assumeMock } from 'utils/testing'

import { useActivation } from '../Activation/hooks/useActivation'

jest.mock('pages/aiAgent/Activation/hooks/useActivation')

export const applyMockActivationHook = () => {
    const mockUseActivation = assumeMock(useActivation)
    mockUseActivation.mockReturnValue({
        activationButton: <div>ActivationButton</div>,
        activationModal: <div>ActivationModal</div>,
        earlyAccessModal: <div>EarlyAccessModal</div>,
    })
}

applyMockActivationHook()
