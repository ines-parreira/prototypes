import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { defaultUseAiAgentOnboardingNotification } from 'fixtures/onboardingStateNotification'
import { getAiAgentStoreFixture } from 'pages/aiAgent/fixtures/aiAgentStoreFixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { usePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { useAiAgentOnboardingNotification } from '../../hooks/useAiAgentOnboardingNotification'
import { AiAgentPreviewModeSettingsContainer } from '../AiAgentPreviewModeSettingsContainer'

jest.mock('react-router-dom', () => {
    const actualReactRouterDom =
        jest.requireActual<typeof import('react-router-dom')>(
            'react-router-dom',
        )
    return {
        ...actualReactRouterDom,
        useParams: jest.fn() as jest.MockedFunction<
            typeof actualReactRouterDom.useParams
        >,
    }
})

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)
jest.mock('state/notifications/actions')
jest.mock('pages/AppContext')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/aiAgent/hooks/usePlaygroundPanel')

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))
const mockUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext,
)

jest.mock('pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter', () => ({
    useGetOrCreateSnippetHelpCenter: jest.fn(),
}))
const mockUseGetOrCreateSnippetHelpCenter = assumeMock(
    useGetOrCreateSnippetHelpCenter,
)

jest.mock('pages/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: jest.fn(),
}))
const mockUsePublicResources = assumeMock(usePublicResources)

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: jest.fn(),
}))
const mockUseAiAgentOnboardingNotification = assumeMock(
    useAiAgentOnboardingNotification,
)

const mockUseParams = assumeMock(useParams)
const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])
const mockedStore = mockStore(getAiAgentStoreFixture())

const { useAppContext } = require('pages/AppContext')
const mockUseAppContext = jest.mocked(useAppContext)

const {
    useAiAgentNavigation,
} = require('pages/aiAgent/hooks/useAiAgentNavigation')
const mockUseAiAgentNavigation = jest.mocked(useAiAgentNavigation)

const { usePlaygroundPanel } = require('pages/aiAgent/hooks/usePlaygroundPanel')
const mockUsePlaygroundPanel = jest.mocked(usePlaygroundPanel)

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockedStore}>
            <QueryClientProvider client={queryClient}>
                <AiAgentPreviewModeSettingsContainer />
            </QueryClientProvider>
        </Provider>,
    )

describe('AiAgentPreviewModeSettingsView', () => {
    const mockUpdateStoreConfiguration = jest.fn()
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseParams.mockReturnValue({ shopName: 'Test Shop' })
        mockFeatureFlags({
            [FeatureFlagKey.FollowUpAiAgentPreviewMode]: true,
        })
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture(),
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        mockUseGetOrCreateSnippetHelpCenter.mockReturnValue({
            isLoading: false,
            helpCenter: null,
        })
        mockUsePublicResources.mockReturnValue({
            sourceItems: [
                {
                    id: 1,
                    url: 'https://test1.com',
                    status: 'done',
                    source: 'url',
                },
                {
                    id: 2,
                    url: 'https://test2.com',
                    status: 'done',
                    source: 'url',
                },
            ],
            isSourceItemsListLoading: false,
        } as unknown as ReturnType<typeof usePublicResources>)
        mockUseAiAgentOnboardingNotification.mockReturnValue(
            defaultUseAiAgentOnboardingNotification,
        )

        mockUseAppContext.mockReturnValue({
            setCollapsibleColumnChildren: jest.fn(),
            collapsibleColumnChildren: null,
            isCollapsibleColumnOpen: false,
            setIsCollapsibleColumnOpen: jest.fn(),
        })

        mockUseAiAgentNavigation.mockReturnValue({
            routes: {},
            navigationItems: [],
        } as any)

        mockUsePlaygroundPanel.mockReturnValue({
            openPlayground: jest.fn(),
            closePlayground: jest.fn(),
        } as any)
    })

    it('renders form elements properly', () => {
        renderComponent()

        // Check if the form fields are rendered
        expect(
            screen.getByText('Preview', { selector: ':not(h1)' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Enable Preview')).toBeInTheDocument()
        expect(screen.getByLabelText('Set duration')).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('toggles the preview mode section visibility when clicking on toggle input', () => {
        renderComponent()

        // The animated div should initially not be visible
        const animatedDiv = screen.getByLabelText(
            'preview duration form section',
        )
        expect(animatedDiv).toHaveStyle({ height: '0px' })

        // Toggle the input
        fireEvent.click(screen.getByLabelText('Enable Preview'))

        // The div should now be visible with height set
        expect(animatedDiv).toHaveStyle({ height: '166px' })
    })

    it('handles duration input change and shows an error if the input is invalid', () => {
        renderComponent()

        // Change duration to an invalid number (e.g., 0)
        const durationInput = screen.getByLabelText('Set duration')
        fireEvent.change(durationInput, { target: { value: '-1' } })

        // Error message should be shown
        expect(
            screen.getByText('Duration must be greater than 0d'),
        ).toBeInTheDocument()

        // Change duration to another invalid number (e.g., 31)
        fireEvent.change(durationInput, { target: { value: '31' } })
        expect(
            screen.getByText('Duration must be less than 30d'),
        ).toBeInTheDocument()

        fireEvent.change(durationInput, { target: { value: '' } })
        expect(screen.getByText('Duration is required')).toBeInTheDocument()
    })

    it('displays the correct expiry date when duration is valid', () => {
        const mockDate = new Date(2024, 9, 22) // Months are 0-indexed, so 9 represents October
        jest.useFakeTimers({ now: mockDate })

        renderComponent()

        const durationInput = screen.getByLabelText('Set duration')
        fireEvent.change(durationInput, { target: { value: '7' } })
        const formattedDate = 'Tuesday, October 29'

        expect(
            screen.getByText(`Preview will automatically disable on`),
        ).toBeInTheDocument()
        expect(screen.getByText(`${formattedDate}`)).toBeInTheDocument()

        // Clean up and restore the original Date implementation
        jest.useRealTimers()
    })

    it('should display warning banner when no email is connected', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                monitoredEmailIntegrations: [],
            }),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        renderComponent()

        expect(
            screen.getByText('Preview', { selector: ':not(h1)' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Enable Preview')).toBeInTheDocument()
        const labelElement = screen.getByText(/Merchant needs at least/i)
        expect(
            within(labelElement).getByText(/1 email connected/i),
        ).toBeInTheDocument()
        expect(
            within(labelElement).getByText(/1 knowledge added/i),
        ).toBeInTheDocument()
        expect(
            within(labelElement).getByText(/to enable Preview\./i),
        ).toBeInTheDocument()
    })

    it('should display warning banner when there is no knowledge base', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                helpCenterId: null,
            }),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })

        renderComponent()

        expect(
            screen.getByText('Preview', { selector: ':not(h1)' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Enable Preview')).toBeInTheDocument()
        const labelElement = screen.getByText(/Merchant needs at least/i)
        expect(
            within(labelElement).getByText(/1 email connected/i),
        ).toBeInTheDocument()
        expect(
            within(labelElement).getByText(/1 knowledge added/i),
        ).toBeInTheDocument()
        expect(
            within(labelElement).getByText(/to enable Preview\./i),
        ).toBeInTheDocument()
    })

    it('should trigger cancelation call on activate AI agent notification, when Preview mode is enabled', async () => {
        renderComponent()
        fireEvent.click(screen.getByText('Enable Preview'))
        fireEvent.change(screen.getByLabelText('Set duration'), {
            target: { value: '10' },
        })
        fireEvent.click(screen.getByText('Save Changes'))

        await waitFor(() => {
            expect(
                defaultUseAiAgentOnboardingNotification.handleOnCancelActivateAiAgentNotification,
            ).toHaveBeenCalled()
        })
    })

    it('should calls updateStoreConfiguration and displays success notification on enabling Preview mode', async () => {
        renderComponent()
        fireEvent.click(screen.getByText('Enable Preview'))
        fireEvent.change(screen.getByLabelText('Set duration'), {
            target: { value: '10' },
        })
        fireEvent.click(screen.getByText('Save Changes'))

        await waitFor(() => {
            expect(mockUpdateStoreConfiguration).toHaveBeenCalledWith({
                ...getStoreConfigurationFixture(),
                previewModeActivatedDatetime: expect.any(String),
                previewModeValidUntilDatetime: expect.any(String),
                chatChannelDeactivatedDatetime: expect.any(String),
                emailChannelDeactivatedDatetime: expect.any(String),
                deactivatedDatetime: expect.any(String),
            })
        })

        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Preview mode enabled successfully',
            status: NotificationStatus.Success,
        })
    })

    it('should not calls updateStoreConfiguration if storeConfiguration is undefined', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: undefined,
            isLoading: false,
            updateStoreConfiguration: mockUpdateStoreConfiguration,
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        renderComponent()
        expect(screen.getByLabelText('loader')).toBeInTheDocument()
    })

    it('should not calls updateStoreConfiguration if no email is connected', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                monitoredEmailIntegrations: [],
            }),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        renderComponent()

        fireEvent.click(screen.getByText('Save Changes'))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should not calls updateStoreConfiguration if there is no knowledge base', () => {
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                helpCenterId: null,
            }),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })

        renderComponent()

        fireEvent.click(screen.getByText('Save Changes'))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should not calls updateStoreConfiguration if no changes is made and previewMode already disabled', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Save Changes'))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should not calls updateStoreConfiguration if no changes is made and previewMode already enabled', () => {
        const mockCurrentDate = new Date(2024, 11, 4)
        const mockExpiryDate = new Date(mockCurrentDate)
        mockExpiryDate.setDate(mockCurrentDate.getDate() + 7)

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                emailChannelDeactivatedDatetime: mockCurrentDate.toISOString(),
                chatChannelDeactivatedDatetime: mockCurrentDate.toISOString(),
                previewModeActivatedDatetime: mockCurrentDate.toISOString(),
                previewModeValidUntilDatetime: mockExpiryDate.toISOString(),
                isPreviewModeActive: true,
            }),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        renderComponent()

        fireEvent.click(screen.getByText('Save Changes'))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        expect(mockDispatch).not.toHaveBeenCalled()
        expect(notify).not.toHaveBeenCalled()
    })

    it('should not calls updateStoreConfiguration and display notification error if duration is following the requirement', () => {
        renderComponent()
        fireEvent.click(screen.getByText('Enable Preview'))
        const durationInput = screen.getByLabelText('Set duration')
        fireEvent.change(durationInput, { target: { value: '-1' } })
        fireEvent.click(screen.getByText('Save Changes'))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Duration must be greater than 0d',
            status: NotificationStatus.Error,
        })

        fireEvent.change(durationInput, { target: { value: '33' } })
        fireEvent.click(screen.getByText('Save Changes'))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Duration must be less than 30d',
            status: NotificationStatus.Error,
        })

        fireEvent.change(durationInput, { target: { value: '' } })
        fireEvent.click(screen.getByText('Save Changes'))

        expect(mockUpdateStoreConfiguration).not.toHaveBeenCalled()
        expect(mockDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            message: 'Duration is required',
            status: NotificationStatus.Error,
        })
    })

    it('should resets form on Cancel', () => {
        renderComponent()
        fireEvent.click(screen.getByText('Enable Preview'))
        fireEvent.change(screen.getByLabelText('Set duration'), {
            target: { value: '15' },
        })

        fireEvent.click(screen.getByText('Cancel'))
        expect(screen.getByLabelText('Set duration')).toHaveValue(7)
    })

    it('displays the correct expiry date when duration is valid', () => {
        const mockCurrentDate = new Date(2024, 10, 4) // months are 0-indexed, so 10 represents November
        jest.useFakeTimers({ now: mockCurrentDate })
        const mockExpiryDate = new Date(mockCurrentDate)
        mockExpiryDate.setDate(mockCurrentDate.getDate() + 9)

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: getStoreConfigurationFixture({
                emailChannelDeactivatedDatetime: mockCurrentDate.toISOString(),
                chatChannelDeactivatedDatetime: mockCurrentDate.toISOString(),
                previewModeActivatedDatetime: mockCurrentDate.toISOString(),
                previewModeValidUntilDatetime: mockExpiryDate.toISOString(),
                isPreviewModeActive: true,
            }),
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })

        renderComponent()

        expect(screen.getByText('Set duration')).toBeInTheDocument()
        expect(screen.getByDisplayValue('9')).toBeInTheDocument()
        expect(
            screen.getByText(`Preview will automatically disable on`),
        ).toBeInTheDocument()
        expect(screen.getByText('Wednesday, November 13')).toBeInTheDocument()

        jest.useRealTimers()
    })
})
