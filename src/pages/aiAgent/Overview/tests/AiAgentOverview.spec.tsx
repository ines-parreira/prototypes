// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import { useLocation } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import * as segment from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useThankYouModal } from 'pages/aiAgent/Overview/hooks/useThankYouModal'
import { initialState as initialStatsFiltersState } from 'state/stats/statsSlice'
import { RootState, StoreDispatch, StoreState } from 'state/types'
import { initialState } from 'state/ui/stats/filtersSlice'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import { AiAgentOverview } from '../AiAgentOverview'
import { AiAgentOverviewRootStateFixture } from './AiAgentOverviewRootState.fixture'

jest.mock('react-router')
jest.mock('pages/aiAgent/Overview/hooks/useThankYouModal')

const logEventMock = jest.spyOn(segment, 'logEvent').mockImplementation(jest.fn)

const defaultLocation = {
    pathname: '',
    search: '',
    state: '',
    hash: '',
}

const handleModalAction = jest.fn()

const defaultThankYouModalValues = {
    isOpen: false,
    isDisabled: false,
    isLoading: false,
    handleModalAction,
    modalContent: {
        title: 'Your account is ready!',
        description: '',
        actionLabel: 'Go live with AI agent',
        closeLabel: 'Close',
    },
}

const mockUseThankYouModal = useThankYouModal as jest.Mock
const useLocationMock = assumeMock(useLocation)
useLocationMock.mockReturnValue(defaultLocation)

const rootState = AiAgentOverviewRootStateFixture.start()
    .with2ShopifyIntegrations()
    .build()
const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const defaultStore = {
    ...rootState,
    ui: {
        stats: { filters: initialState },
    },
    stats: initialStatsFiltersState,
} as StoreState

const renderComponent = () => {
    return render(
        <Provider store={mockStore(defaultStore)}>
            <QueryClientProvider client={queryClient}>
                <AiAgentOverview />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('AiAgentOverview', () => {
    beforeEach(() => {
        logEventMock.mockClear()
        mockUseThankYouModal.mockReturnValue(defaultThankYouModalValues)
    })
    it('should render', () => {
        const { queryByText } = renderComponent()

        expect(queryByText(/Welcome,.*/)).toBeTruthy()
        expect(queryByText('AI Agent Performance')).toBeTruthy()
        expect(queryByText('Complete AI Agent Setup')).toBeTruthy()
    })

    it('should not renders the Thank You modal', () => {
        const { queryByText } = renderComponent()
        expect(queryByText('Your account is ready')).toBeNull()
    })

    it('should call the segment log', () => {
        renderComponent()
        expect(logEventMock).toHaveBeenCalledTimes(1)
        expect(logEventMock).toHaveBeenCalledWith(
            segment.SegmentEvent.AiAgentOverviewPageView,
        )
    })

    describe('Thank you Modal', () => {
        it('should renders the Thank You modal when it is not disabled', async () => {
            mockUseThankYouModal.mockReturnValue({
                ...defaultThankYouModalValues,
                isOpen: true,
            })

            const { findByText } = renderComponent()

            expect(
                await findByText(/Your account is ready!/),
            ).toBeInTheDocument()
        })

        it('should call the go live action and close action when we click on the buttons', async () => {
            mockUseThankYouModal.mockReturnValue({
                ...defaultThankYouModalValues,
                isOpen: true,
            })

            const { findByText, getByText } = renderComponent()

            expect(
                await findByText(/Your account is ready!/),
            ).toBeInTheDocument()

            fireEvent.click(getByText('Go live with AI agent'))

            expect(handleModalAction).toHaveBeenCalledWith('confirm')

            fireEvent.click(getByText('Close'))

            expect(handleModalAction).toHaveBeenCalledWith('close')
        })

        it('should renders the Thank You modal when it is disabled', async () => {
            mockUseThankYouModal.mockReturnValue({
                ...defaultThankYouModalValues,
                isOpen: true,
                isDisabled: true,
                modalContent: {
                    title: "You're almost ready",
                    description:
                        'Continue setting up your AI Agent and push it live when ready',
                    actionLabel: 'Continue',
                    closeLabel: '',
                },
            })

            const { findByText } = renderComponent()

            expect(await findByText(/You're almost ready/)).toBeInTheDocument()
            expect(
                await findByText(
                    /Continue setting up your AI Agent and push it live when ready/,
                ),
            ).toBeInTheDocument()
        })

        it('should call the clear query when the button continue exists', async () => {
            mockUseThankYouModal.mockReturnValue({
                ...defaultThankYouModalValues,
                isOpen: true,
                isDisabled: true,
                modalContent: {
                    title: "You're almost ready",
                    description:
                        'Continue setting up your AI Agent and push it live when ready',
                    actionLabel: 'Continue',
                    closeLabel: '',
                },
            })

            const { findByText, getByText } = renderComponent()

            expect(await findByText(/You're almost ready/)).toBeInTheDocument()

            fireEvent.click(getByText('Continue'))

            expect(handleModalAction).toHaveBeenCalledWith('confirm')
        })
    })

    describe('when coming from another page', () => {
        it('should not renders the Thank You modal', () => {
            useLocationMock.mockReturnValue({
                ...defaultLocation,
                state: { from: '/app/ai-agent/test' },
            })

            const { queryByText } = renderComponent()

            expect(queryByText('Your account is ready')).toBeNull()
        })
    })

    it('should render the resource section when the flag standalone-conv-ai_overview-page-resource-section is Available', () => {
        mockFlags({
            [FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection]: true,
        })
        const { queryByText } = renderComponent()
        expect(queryByText('Resources')).toBeTruthy()
    })

    it('should not render the resource section when the flag standalone-conv-ai_overview-page-resource-section is Unavailable', () => {
        mockFlags({
            [FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection]: false,
        })
        const { queryByText } = renderComponent()
        expect(queryByText('Resources')).toBeFalsy()
    })
})
