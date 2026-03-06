import { assumeMock } from '@repo/testing'

import { useActivation } from '../Activation/hooks/useActivation'
import {
    useStoreActivations,
    useStoreConfigurations,
} from '../Activation/hooks/useStoreActivations'

jest.mock('pages/aiAgent/Activation/hooks/useActivation')
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')

export const applyMockActivationHook = () => {
    const mockUseActivation = assumeMock(useActivation)
    mockUseActivation.mockReturnValue({
        showActivationModal: () => {},
        showEarlyAccessModal: () => {},
        isOnNewPlan: false,
        activationModal: <div>ActivationModal</div>,
        earlyAccessModal: <div>EarlyAccessModal</div>,
        onUpgradePlanClick: () => Promise.resolve(),
    })

    const mockUseStoreActivations = assumeMock(useStoreActivations)
    mockUseStoreActivations.mockReturnValue({
        storeActivations: {},
        allStoreActivations: {},
        progressPercentage: 0,
        isFetchLoading: false,
        isSaveLoading: false,
        changeSales: () => {},
        changeSupport: () => {},
        changeSupportChat: () => {},
        changeSupportEmail: () => {},
        saveStoreConfigurations: () => Promise.resolve(),
        migrateToNewPricing: () => Promise.resolve(),
        endTrial: () => Promise.resolve(),
        activation: () => ({
            canActivate: () => ({
                isLoading: false,
                isDisabled: false,
            }),
            activate: () => Promise.resolve(),
            isActivating: false,
        }),
    })

    const mockUseStoreConfigurations = assumeMock(useStoreConfigurations)
    mockUseStoreConfigurations.mockReturnValue({
        storeConfigurations: [],
        isLoading: false,
        storeNames: [],
    })
}

applyMockActivationHook()
