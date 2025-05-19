import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { toImmutable } from 'common/utils'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { useAtLeastOneStoreHasActiveTrial } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import {
    useStoreActivations,
    useStoreConfigurations,
} from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { getStoresEligibleForTrial } from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { RootState } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

import ShoppingAssistantTrialSystemBanner from '../ShoppingAssistantTrialSystemBanner'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useLocation: jest.fn(),
}))
const useLocationMock = assumeMock(useLocation)

jest.mock('hooks/aiAgent/useCanUseAiSalesAgent')

const useAtLeastOneStoreHasActiveTrialMock = assumeMock(
    useAtLeastOneStoreHasActiveTrial,
)

jest.mock('pages/aiAgent/utils/aiSalesAgentTrialUtils')
const getStoresEligibleForTrialMock = assumeMock(getStoresEligibleForTrial)

jest.mock('pages/aiAgent/Activation/hooks/useActivateAiAgentTrial')
const useActivateAiAgentTrialMock = assumeMock(useActivateAiAgentTrial)

const mockUseStoreActivations = assumeMock(useStoreActivations)
const mockStoreConfigurations = assumeMock(useStoreConfigurations)

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

const mockStore = configureMockStore()

const renderComponent = () => {
    return renderWithRouter(
        <Provider store={mockStore(defaultState)}>
            <ShoppingAssistantTrialSystemBanner />
        </Provider>,
    )
}

describe('ShoppingAssistantTrialSystemBanner', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useAtLeastOneStoreHasActiveTrialMock.mockReturnValue(false)
        mockUseFlag.mockReturnValue(true)
        getStoresEligibleForTrialMock.mockReturnValue([
            {
                name: 'store1',
                configuration: {
                    salesDeactivatedDatetime: null,
                },
            },
        ] as ReturnType<typeof getStoresEligibleForTrial>)
        mockUseStoreActivations.mockReturnValue({
            storeActivations: {},
        } as ReturnType<typeof useStoreActivations>)
        mockStoreConfigurations.mockReturnValue({
            storeConfigurations: {},
        } as ReturnType<typeof useStoreConfigurations>)

        useActivateAiAgentTrialMock.mockReturnValue({
            canStartTrial: true,
            canStartTrialFromFeatureFlag: true,
            startTrial: () => {},
            isLoading: false,
            routes: {} as any,
            shopName: 'store1',
        })

        useLocationMock.mockReturnValue({
            pathname: '/sales',
        } as any)
    })

    it('should render', () => {
        renderComponent()

        expect(
            screen.getByText(
                'AI Agent just got even smarter with brand new Shopping Assistant skills,',
            ),
        ).toBeInTheDocument()
    })

    it('should not render if the feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        renderComponent()

        expect(
            screen.queryByText(
                'AI Agent just got even smarter with brand new Shopping Assistant skills,',
            ),
        ).not.toBeInTheDocument()
    })

    it('should not render if the account is not eligible for any type of trial', () => {
        mockUseFlag.mockReturnValue(true)
        useActivateAiAgentTrialMock.mockReturnValue({
            canStartTrial: false,
            canStartTrialFromFeatureFlag: false,
            startTrial: () => {},
            isLoading: false,
            routes: {} as any,
            shopName: 'store1',
        })
        renderComponent()

        expect(
            screen.queryByText(
                'AI Agent just got even smarter with brand new Shopping Assistant skills,',
            ),
        ).not.toBeInTheDocument()
    })

    it('should not render if the user is visiting the tickets page', () => {
        mockUseFlag.mockReturnValue(true)
        useLocationMock.mockReturnValue({
            pathname: '/tickets',
        } as any)
        renderComponent()

        expect(
            screen.queryByText(
                'AI Agent just got even smarter with brand new Shopping Assistant skills,',
            ),
        ).not.toBeInTheDocument()
    })
})
