import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import {
    useCreatePostStoreInstallationStepPure,
    useUpdatePostStoreInstallationStepPure,
    useUpdateStepConfigurationPure,
    useUpdateStepNotificationsPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import { useGetSetupTasksConfigByCategory } from 'pages/aiAgent/Overview/components/SetupTasksSection/hooks/useGetSetupTasksConfigByCategory'
import { mockStore } from 'utils/testing'

import { SetupTaskSection } from '../SetupTaskSection'
import { mockSetupTasksConfigByCategory } from './fixtures/setupTasksConfigByCategory.fixture'

jest.mock('models/aiAgentPostStoreInstallationSteps/queries')

jest.mock(
    'pages/aiAgent/Overview/components/SetupTasksSection/hooks/useGetSetupTasksConfigByCategory',
)

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            deployEmail: '/mock/deploy-email-route',
            deployChat: '/mock/deploy-chat-route',
        },
    }),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels', () => ({
    __esModule: true,
    default: jest.fn(() => []),
}))

jest.mock(
    'pages/aiAgent/Overview/hooks/pendingTasks/useFetchChatIntegrationsStatusData',
    () => ({
        useFetchChatIntegrationsStatusData: jest.fn(() => ({
            data: [],
            isLoading: false,
        })),
    }),
)

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: () => ({
        storeConfiguration: {
            monitoredEmailIntegrations: [],
            monitoredChatIntegrations: [],
        },
        isLoading: false,
        updateStoreConfiguration: jest.fn(),
        createStoreConfiguration: jest.fn(),
        isPendingCreateOrUpdate: false,
    }),
}))

const mockUseGetSetupTasksConfigByCategory =
    useGetSetupTasksConfigByCategory as jest.MockedFunction<
        typeof useGetSetupTasksConfigByCategory
    >

const mockUseUpdatePostStoreInstallationStepPure =
    useUpdatePostStoreInstallationStepPure as jest.MockedFunction<
        typeof useUpdatePostStoreInstallationStepPure
    >

const mockUseCreatePostStoreInstallationStepPure =
    useCreatePostStoreInstallationStepPure as jest.MockedFunction<
        typeof useCreatePostStoreInstallationStepPure
    >

const mockUseUpdateStepConfigurationPure =
    useUpdateStepConfigurationPure as jest.MockedFunction<
        typeof useUpdateStepConfigurationPure
    >

const mockUseUpdateStepNotificationsPure =
    useUpdateStepNotificationsPure as jest.MockedFunction<
        typeof useUpdateStepNotificationsPure
    >

describe('SetupTaskSection', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        jest.clearAllMocks()
        mockUseGetSetupTasksConfigByCategory.mockReturnValue(
            mockSetupTasksConfigByCategory,
        )
        mockUseUpdatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
            mutate: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            isIdle: true,
        } as any)
        mockUseCreatePostStoreInstallationStepPure.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
            mutate: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            isIdle: true,
        } as any)
        mockUseUpdateStepConfigurationPure.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
            mutate: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            isIdle: true,
        } as any)
        mockUseUpdateStepNotificationsPure.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
            mutate: jest.fn(),
            isLoading: false,
            isError: false,
            isSuccess: false,
            isIdle: true,
        } as any)
    })

    const renderComponent = () => {
        const store = mockStore({
            currentAccount: fromJS({ id: 123 }),
        })
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <SetupTaskSection shopName="test-shop" shopType="shopify" />
                </QueryClientProvider>
            </Provider>,
        )
    }

    it('should render the setup checklist header', () => {
        renderComponent()

        expect(screen.getByText('Setup checklist')).toBeInTheDocument()
        expect(screen.getByText(/33.*complete/)).toBeInTheDocument()
    })

    it('should render all category tabs', () => {
        renderComponent()

        expect(screen.getByText('Essential')).toBeInTheDocument()
        expect(screen.getByText('Customize')).toBeInTheDocument()
        expect(screen.getByText('Train')).toBeInTheDocument()
        expect(screen.getByText('Deploy')).toBeInTheDocument()
    })

    it('should show first incomplete category tasks by default', () => {
        renderComponent()

        expect(
            screen.getByText(/Enable.*Trigger on Search/),
        ).toBeInTheDocument()
    })

    it('should switch category when clicking on a different tab', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Essential'))

        expect(screen.getByText('Verify your email domain')).toBeInTheDocument()
        expect(
            screen.queryByText(/Enable.*Trigger on Search/),
        ).not.toBeInTheDocument()
    })

    it('should show Train category tasks when Train tab is clicked', async () => {
        renderComponent()

        fireEvent.click(screen.getByText('Train'))

        await waitFor(() => {
            expect(screen.getByText('Create an Action')).toBeInTheDocument()
            expect(
                screen.getByText('Monitor AI Agent interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should show Deploy category tasks when Deploy tab is clicked', async () => {
        renderComponent()

        fireEvent.click(screen.getByText('Deploy'))

        await waitFor(() => {
            expect(
                screen.getByText('Enable AI Agent on chat'),
            ).toBeInTheDocument()
        })
    })

    it('should show completed icon for completed tasks', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Essential'))

        const verifyEmailTask = screen.getByText('Verify your email domain')
        const updateShopifyTask = screen.getByText('Update Shopify permissions')

        expect(
            verifyEmailTask.closest('.stepTitleContainer'),
        ).toBeInTheDocument()
        expect(
            updateShopifyTask.closest('.stepTitleContainer'),
        ).toBeInTheDocument()
    })

    it('should expand accordion item and show task body when clicked', async () => {
        renderComponent()

        fireEvent.click(screen.getByText('Essential'))

        const verifyEmailTask = screen.getByText('Verify your email domain')

        fireEvent.click(verifyEmailTask)

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Ensure customers receive emails from the AI Agent by verifying your domain.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Verify' }),
            ).toBeInTheDocument()
        })
    })

    it('should show loading icon in the progress section', () => {
        renderComponent()

        const loadingIcon = screen.getByAltText('loading icon')
        expect(loadingIcon).toBeInTheDocument()
        expect(loadingIcon).toHaveAttribute('width', '16px')
    })

    it('should mark Essential category tab as completed', () => {
        renderComponent()

        const essentialTab = screen.getByText('Essential').parentElement
        expect(essentialTab?.className).toMatch(/completed/)
    })

    it('should not mark incomplete categories as completed', () => {
        renderComponent()

        const customizeTab = screen.getByText('Customize').closest('div')
        expect(customizeTab).not.toHaveClass('completed')
    })

    it('should apply selected class to the currently selected category', () => {
        renderComponent()

        let customizeTab = screen.getByText('Customize').parentElement
        expect(customizeTab?.className).toMatch(/selected/)

        fireEvent.click(screen.getByText('Train'))

        const trainTab = screen.getByText('Train').parentElement
        expect(trainTab?.className).toMatch(/selected/)

        customizeTab = screen.getByText('Customize').parentElement
        expect(customizeTab?.className).not.toMatch(/selected/)
    })

    it('should handle multiple category switches correctly', () => {
        renderComponent()

        expect(
            screen.getByText(/Enable.*Trigger on Search/),
        ).toBeInTheDocument()

        fireEvent.click(screen.getByText('Essential'))
        expect(screen.getByText('Verify your email domain')).toBeInTheDocument()
        expect(
            screen.queryByText(/Enable.*Trigger on Search/),
        ).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Train'))
        expect(screen.getByText('Create an Action')).toBeInTheDocument()
        expect(
            screen.queryByText(/Enable.*Trigger on Search/),
        ).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Deploy'))
        expect(screen.getByText('Enable AI Agent on chat')).toBeInTheDocument()
        expect(screen.queryByText('Create an Action')).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('Essential'))
        expect(screen.getByText('Verify your email domain')).toBeInTheDocument()
        expect(
            screen.queryByText('Enable AI Agent on chat'),
        ).not.toBeInTheDocument()
    })

    it('should not render when loading', () => {
        mockUseGetSetupTasksConfigByCategory.mockReturnValue({
            tasksConfigByCategory: {},
            completionPercentage: 0,
            isLoading: true,
            postGoLiveStepId: undefined,
            postGoLiveStep: undefined,
            accountId: 123,
            error: null,
        })

        const { container } = renderComponent()

        expect(container.firstChild).toBeNull()
    })

    it('should not render when no categories exist', () => {
        mockUseGetSetupTasksConfigByCategory.mockReturnValue({
            tasksConfigByCategory: {},
            completionPercentage: 0,
            isLoading: false,
            postGoLiveStepId: undefined,
            postGoLiveStep: undefined,
            accountId: 123,
            error: null,
        })

        const { container } = renderComponent()

        expect(container.firstChild).toBeNull()
    })
})
