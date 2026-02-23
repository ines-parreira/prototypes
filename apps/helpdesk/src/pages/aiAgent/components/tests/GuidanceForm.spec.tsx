/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type React from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { onApiError } from 'state/utils'
import { mockStore } from 'utils/testing'

import { handleGuidanceDuplicateError } from '../../utils/guidance.utils'
import { GuidanceForm } from '../GuidanceForm/GuidanceForm'

// Get access to the mocked functions
const mockNotify = jest.mocked(notify)
const mockOnApiError = jest.mocked(onApiError)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: () => mockDispatch,
}))

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification', () => ({
    useAiAgentOnboardingNotification: () => ({
        isLoading: false,
        handleOnTriggerActivateAiAgentNotification: jest.fn(),
    }),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceAiSuggestions', () => ({
    useGuidanceAiSuggestions: () => ({
        guidanceArticles: [],
        isLoadingAiGuidances: false,
        isLoadingGuidanceArticleList: false,
    }),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            guidance: '/guidance',
            test: '/test',
        },
    }),
}))

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('state/utils', () => ({
    onApiError: jest.fn(),
}))

jest.mock('../../utils/guidance.utils', () => ({
    handleGuidanceDuplicateError: jest.fn(),
}))

const mockHandleGuidanceDuplicateError = jest.mocked(
    handleGuidanceDuplicateError,
)

describe('GuidanceForm', () => {
    const defaultProps = {
        shopName: 'test-shop',
        availableActions: [],
        isLoading: false,
        actionType: 'create' as const,
        onSubmit: jest.fn(),
        sourceType: 'scratch' as const,
        helpCenterId: 1,
    }

    const renderWithProvider = (ui: React.ReactElement) => {
        return render(
            <Provider store={mockStore({})}>
                <MemoryRouter>{ui}</MemoryRouter>
            </Provider>,
        )
    }

    it('renders GuidanceEditor', () => {
        const { container } = renderWithProvider(
            <GuidanceForm {...defaultProps} />,
        )

        expect(
            container.querySelector('.rich-textarea-wrapper'),
        ).toBeInTheDocument()
    })

    it('passes correct props to GuidanceEditor', () => {
        const { container } = renderWithProvider(
            <GuidanceForm
                {...defaultProps}
                initialFields={{
                    name: 'Test Name',
                    content: 'Test Content',
                    isVisible: true,
                }}
            />,
        )

        const editor = container.querySelector('.rich-textarea-wrapper')
        expect(editor).toBeInTheDocument()

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        expect(editorContent?.textContent).toBe('Test Content')
    })

    it('submits the form with correct values when using GuidanceEditor', () => {
        const onSubmit = jest.fn()

        const { getByLabelText, getByText } = renderWithProvider(
            <GuidanceForm
                {...defaultProps}
                onSubmit={onSubmit}
                initialFields={{
                    name: 'Initial Name',
                    content: '<div>Initial Content</div>',
                    isVisible: true,
                }}
            />,
        )

        const nameInput = getByLabelText(/Guidance name/i)
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } })

        const submitButton = getByText('Create Guidance')
        fireEvent.click(submitButton)

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Updated Name',
                content: '<div>Initial Content</div>',
                isVisible: true,
            }),
        )
    })

    it('handles visibility toggle correctly', () => {
        const { getByLabelText } = renderWithProvider(
            <GuidanceForm
                {...defaultProps}
                initialFields={{
                    name: 'Test Name',
                    content: 'Test Content',
                    isVisible: false,
                }}
            />,
        )

        const visibilityToggle = getByLabelText(/Available for AI Agent/i)
        expect(visibilityToggle).not.toBeChecked()

        fireEvent.click(visibilityToggle)

        expect(visibilityToggle).toBeChecked()
    })

    describe('Error Handling', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            // Mock notify to return an action object that includes the passed notification
            mockNotify.mockImplementation(
                (notification) =>
                    ({
                        type: 'NOTIFY',
                        ...notification,
                    }) as any,
            )
            // Mock onApiError to return a thunk function that when called returns an action
            mockOnApiError.mockReturnValue((dispatch: any) => {
                dispatch({ type: 'API_ERROR' })
            })
        })

        it('handles duplicate title error correctly', async () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'An article with the title "Test Title" already exists in this help center',
                        },
                    },
                },
            }

            mockHandleGuidanceDuplicateError.mockReturnValue({
                isDuplicate: true,
                type: 'title',
                notification: {
                    status: NotificationStatus.Error,
                    message:
                        'Guidance with the name "Test Title" already exists in this help center',
                },
            })

            const onSubmit = jest.fn().mockRejectedValue(error)

            const { getByText } = renderWithProvider(
                <GuidanceForm
                    {...defaultProps}
                    onSubmit={onSubmit}
                    initialFields={{
                        name: 'Test Title',
                        content: 'Test Content',
                        isVisible: true,
                    }}
                />,
            )

            const submitButton = getByText('Create Guidance')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockHandleGuidanceDuplicateError).toHaveBeenCalledWith(
                error,
                'Test Title',
            )

            expect(mockNotify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message:
                    'Guidance with the name "Test Title" already exists in this help center',
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'NOTIFY',
                    status: NotificationStatus.Error,
                    message:
                        'Guidance with the name "Test Title" already exists in this help center',
                }),
            )
        })

        it('handles duplicate content error correctly', async () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'An article with identical content already exists in this help center',
                        },
                    },
                },
            }

            mockHandleGuidanceDuplicateError.mockReturnValue({
                isDuplicate: true,
                type: 'content',
                notification: {
                    status: NotificationStatus.Error,
                    message:
                        'Guidance with identical instructions already exists in this help center',
                },
            })

            const onSubmit = jest.fn().mockRejectedValue(error)

            const { getByText } = renderWithProvider(
                <GuidanceForm
                    {...defaultProps}
                    onSubmit={onSubmit}
                    initialFields={{
                        name: 'Test Content',
                        content: 'Test Content',
                        isVisible: true,
                    }}
                />,
            )

            const submitButton = getByText('Create Guidance')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockHandleGuidanceDuplicateError).toHaveBeenCalledWith(
                error,
                'Test Content',
            )

            expect(mockNotify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message:
                    'Guidance with identical instructions already exists in this help center',
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'NOTIFY',
                    status: NotificationStatus.Error,
                    message:
                        'Guidance with identical instructions already exists in this help center',
                }),
            )
        })

        it('falls back to default error handling for other errors', async () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'Some other error message',
                        },
                    },
                },
            }

            mockHandleGuidanceDuplicateError.mockReturnValue({
                isDuplicate: false,
            })

            const onSubmit = jest.fn().mockRejectedValue(error)

            const { getByText } = renderWithProvider(
                <GuidanceForm
                    {...defaultProps}
                    onSubmit={onSubmit}
                    initialFields={{
                        name: 'Test Name',
                        content: 'Test Content',
                        isVisible: true,
                    }}
                />,
            )

            const submitButton = getByText('Create Guidance')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockHandleGuidanceDuplicateError).toHaveBeenCalledWith(
                error,
                'Test Name',
            )

            // Should use onApiError for non-duplicate errors
            expect(mockOnApiError).toHaveBeenCalledWith(
                error,
                'Error during guidance article create.',
            )
        })

        it('falls back to default error handling when no error message is present', async () => {
            const error = {
                response: {
                    data: {},
                },
            }

            mockHandleGuidanceDuplicateError.mockReturnValue({
                isDuplicate: false,
            })

            const onSubmit = jest.fn().mockRejectedValue(error)

            const { getByText } = renderWithProvider(
                <GuidanceForm
                    {...defaultProps}
                    onSubmit={onSubmit}
                    initialFields={{
                        name: 'Test Name',
                        content: 'Test Content',
                        isVisible: true,
                    }}
                />,
            )

            const submitButton = getByText('Create Guidance')
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockHandleGuidanceDuplicateError).toHaveBeenCalledWith(
                error,
                'Test Name',
            )

            // Should use onApiError when no specific error message
            expect(mockOnApiError).toHaveBeenCalledWith(
                error,
                'Error during guidance article create.',
            )
        })
    })
})
