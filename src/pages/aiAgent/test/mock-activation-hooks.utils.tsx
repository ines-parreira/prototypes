import React from 'react'

import { assumeMock } from 'utils/testing'

import { useActivation } from '../Activation/hooks/useActivation'

jest.mock('pages/aiAgent/Activation/hooks/useActivation')

export const applyMockActivationHook = () => {
    const mockUseActivation = assumeMock(useActivation)
    mockUseActivation.mockReturnValue({
        ActivationButton: () => <div>ActivationButton</div>,
        ActivationModal: () => <div>ActivationModal</div>,
        EarlyAccessModal: () => <div>EarlyAccessModal</div>,
    })
}

applyMockActivationHook()
