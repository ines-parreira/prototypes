import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import { usePostStoreInstallationStepsMutation } from 'pages/aiAgent/hooks/usePostStoreInstallationStepsMutation'
import { mockStore } from 'utils/testing'

import { CategoryContent } from '../CategoryContent'
import {
    UpdateShopifyPermissionsBody,
    VerifyEmailDomainBody,
} from '../SetupTaskBodies'
import type { TaskConfig } from '../types'

jest.mock('pages/aiAgent/hooks/usePostStoreInstallationStepsMutation')

const mockUsePostStoreInstallationStepsMutation =
    usePostStoreInstallationStepsMutation as jest.MockedFunction<
        typeof usePostStoreInstallationStepsMutation
    >

describe('CategoryContent', () => {
    const mockUpdateStepConfiguration = jest.fn()

    const mockTasks: TaskConfig[] = [
        {
            stepName: StepName.VERIFY_EMAIL_DOMAIN,
            displayName: 'Verify your email domain',
            isCompleted: true,
            body: VerifyEmailDomainBody,
            featureUrl: '/ai-agent/settings',
        },
        {
            stepName: StepName.UPDATE_SHOPIFY_PERMISSIONS,
            displayName: 'Update Shopify permissions',
            isCompleted: false,
            body: UpdateShopifyPermissionsBody,
            featureUrl: '/ai-agent/settings',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        mockUpdateStepConfiguration.mockClear()
        mockUsePostStoreInstallationStepsMutation.mockReturnValue({
            updateStepConfiguration: mockUpdateStepConfiguration,
            createPostStoreInstallationStep: jest.fn(),
            updatePostStoreInstallationStep: jest.fn(),
            updateStepNotifications: jest.fn(),
            isLoading: false,
            error: null,
        })
    })

    const renderComponent = ({
        tasks = mockTasks,
        postGoLiveStepId = 'mock-step-id',
    }: {
        tasks?: TaskConfig[]
        postGoLiveStepId?: string
    } = {}) => {
        const store = mockStore({
            currentAccount: fromJS({ id: 123, domain: 'test-domain' }),
        })
        return render(
            <Provider store={store}>
                <CategoryContent
                    selectedCategoryTasks={tasks}
                    shopName="test-shop"
                    postGoLiveStepId={postGoLiveStepId}
                    shopType="test-type"
                />
            </Provider>,
        )
    }

    it('should render all tasks', () => {
        renderComponent()

        expect(screen.getByText('Verify your email domain')).toBeInTheDocument()
        expect(
            screen.getByText('Update Shopify permissions'),
        ).toBeInTheDocument()
    })

    it('should show check icon for completed tasks', () => {
        renderComponent()

        const checkIcon = screen.getByLabelText('circle-check')
        expect(checkIcon).toBeInTheDocument()
    })

    it('should show circle icon for incomplete tasks', () => {
        renderComponent()

        const circleIcon = screen.getByLabelText('shape-circle')
        expect(circleIcon).toBeInTheDocument()
    })

    it('should call updateStepConfiguration when clicking checkbox to mark as complete', async () => {
        renderComponent()

        const circleIcon = screen.getByLabelText('shape-circle')

        act(() => {
            fireEvent.click(circleIcon)
        })

        await waitFor(() => {
            expect(mockUpdateStepConfiguration).toHaveBeenCalledWith(
                'mock-step-id',
                {
                    stepName: StepName.UPDATE_SHOPIFY_PERMISSIONS,
                    stepCompletedDatetime: expect.any(String),
                },
            )
        })
    })

    it('should call updateStepConfiguration when clicking checkbox to mark as incomplete', async () => {
        renderComponent()

        const checkIcon = screen.getByLabelText('circle-check')

        act(() => {
            fireEvent.click(checkIcon)
        })

        await waitFor(() => {
            expect(mockUpdateStepConfiguration).toHaveBeenCalledWith(
                'mock-step-id',
                {
                    stepName: StepName.VERIFY_EMAIL_DOMAIN,
                    stepCompletedDatetime: null,
                },
            )
        })
    })

    it('should not call updateStepConfiguration when postGoLiveStepId is undefined', () => {
        const store = mockStore({
            currentAccount: fromJS({ id: 123, domain: 'test-domain' }),
        })
        render(
            <Provider store={store}>
                <CategoryContent
                    selectedCategoryTasks={mockTasks}
                    shopName="test-shop"
                    postGoLiveStepId={undefined}
                    shopType="shopify"
                />
            </Provider>,
        )

        const circleIcon = screen.getByLabelText('shape-circle')

        fireEvent.click(circleIcon)

        expect(mockUpdateStepConfiguration).not.toHaveBeenCalled()
    })

    it('should expand accordion item when clicking on task title', async () => {
        renderComponent()

        const verifyEmailTask = screen.getByText('Verify your email domain')

        fireEvent.click(verifyEmailTask)

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Ensure customers receive emails from the AI Agent by verifying your domain.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should render task body with correct props', async () => {
        renderComponent()

        const updateShopifyTask = screen.getByText('Update Shopify permissions')

        fireEvent.click(updateShopifyTask)

        await waitFor(() => {
            const bodyContent = screen.getByText(
                /Update Shopify permissions to give AI Agent to information about your customers, orders and products/,
            )
            expect(bodyContent).toBeInTheDocument()
        })
    })

    it('should render empty when no tasks are provided', () => {
        const { container } = renderComponent({ tasks: [] })

        const accordion = container.querySelector('.accordionSteps')
        expect(accordion?.children).toHaveLength(0)
    })
})
