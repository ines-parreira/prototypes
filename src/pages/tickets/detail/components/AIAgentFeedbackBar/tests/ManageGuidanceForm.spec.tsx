import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import { LocaleCode } from 'models/helpCenter/types'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import {
    handleGuidanceDuplicateError,
    mapGuidanceFormFieldsToGuidanceArticle,
} from 'pages/aiAgent/utils/guidance.utils'
import { useUnsavedChangesModal } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { onApiError } from 'state/utils'
import { assumeMock } from 'utils/testing'

import { useKnowledgeSourceSideBar } from '../hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { ManageGuidanceForm } from '../ManageGuidanceForm'
import { AiAgentKnowledgeResourceTypeEnum } from '../types'

jest.mock('../utils', () => ({
    getGuidanceUrl: jest.fn(() => '/guidance/1'),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(() => false),
}))

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
)

const useKnowledgeSourceSideBarMock = useKnowledgeSourceSideBar as jest.Mock

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider',
)
const useUnsavedChangesModalMock = useUnsavedChangesModal as jest.Mock

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation')

const useGuidanceArticleMutationMock = useGuidanceArticleMutation as jest.Mock

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: () => ({
            guidanceActions: [],
            isLoading: false,
        }),
    }),
)

jest.mock('pages/aiAgent/hooks/useGuidanceAiSuggestions')

const useGuidanceAiSuggestionsMock = useGuidanceAiSuggestions as jest.Mock

jest.mock('pages/aiAgent/hooks/useAiAgentOnboardingNotification')

const useAiAgentOnboardingNotificationMock =
    useAiAgentOnboardingNotification as jest.Mock

jest.mock('pages/aiAgent/components/GuidanceEditor/GuidanceEditor', () => ({
    GuidanceEditor: (props: any) => (
        <textarea
            data-testid="editor"
            value={props.content}
            onChange={(e) => {
                props.handleUpdateContent(e.target.value)
            }}
        />
    ),
}))

jest.mock('pages/common/forms/input/InputField', () => (props: any) => (
    <input
        data-testid="name-input"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
    />
))

jest.mock('pages/common/components/Drawer', () => {
    const actual = jest.requireActual('pages/common/components/Drawer')

    return {
        Drawer: {
            ...actual.Drawer,
            Header: ({ children }: any) => (
                <div data-testid="drawer-header">{children}</div>
            ),
            Content: ({ children }: any) => <div>{children}</div>,
            Footer: ({ children }: any) => <div>{children}</div>,
        },
    }
})

jest.mock(
    'pages/common/components/UnsavedChangesModal',
    () => (props: any) =>
        props.isOpen ? (
            <div>
                <button onClick={props.onDiscard}>Discard</button>
                <button onClick={props.onSave}>Save</button>
                <button onClick={props.onClose}>Back To Editing</button>
            </div>
        ) : null,
)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('state/utils', () => ({
    onApiError: jest.fn(),
}))

// Get access to the mocked functions
const mockNotify = jest.mocked(notify)
const mockOnApiError = jest.mocked(onApiError)

jest.mock('pages/aiAgent/utils/guidance.utils', () => ({
    handleGuidanceDuplicateError: jest.fn(),
    mapGuidanceFormFieldsToGuidanceArticle: jest.fn(),
}))

const mockHandleGuidanceDuplicateError = jest.mocked(
    handleGuidanceDuplicateError,
)
const mockMapGuidanceFormFieldsToGuidanceArticle = jest.mocked(
    mapGuidanceFormFieldsToGuidanceArticle,
)

describe('ManageGuidanceForm', () => {
    const helpCenter = {
        id: 1,
        default_locale: 'en',
    } as any

    const onSubmitNewMissingKnowledgeMock = jest.fn()

    const baseProps = {
        shopName: 'Demo',
        shopType: 'shopify' as const,
        helpCenter,
        onSubmitNewMissingKnowledge: onSubmitNewMissingKnowledgeMock,
    }

    const mockGuidanceArticle = {
        id: 1,
        title: 'Test Guidance Title',
        content: 'Test guidance content',
        visibility: 'PUBLIC' as const,
        locale: 'en-US' as LocaleCode,
        lastUpdated: '2023-10-01T00:00:00Z',
        templateKey: '',
    }

    const mockGuidanceArticlesList = [
        mockGuidanceArticle,
        {
            id: 2,
            title: 'Guidance Article 2',
            content: 'Content 2',
            visibility: 'PUBLIC',
            locale: 'en-US' as LocaleCode,
            lastUpdated: '2023-10-01T00:00:00Z',
            templateKey: '',
        },
        {
            id: 3,
            title: 'Guidance Article 3',
            content: 'Content 3',
            visibility: 'PUBLIC',
            locale: 'en-US',
            lastUpdated: '2023-10-01T00:00:00Z',
            templateKey: '',
        },
    ]

    beforeEach(() => {
        onSubmitNewMissingKnowledgeMock.mockClear()
        useAppDispatchMock.mockReturnValue(jest.fn())
        useUnsavedChangesModalMock.mockReturnValue({
            isOpen: false,
            openUnsavedChangesModal: jest.fn(),
            closeUnsavedChangesModal: jest.fn(),
            setHasUnsavedChangesRef: jest.fn(),
        })

        // Mock the utility function to return the expected format
        mockMapGuidanceFormFieldsToGuidanceArticle.mockImplementation(
            (formValues, locale, templateKey) => ({
                title: formValues.name,
                content: formValues.content,
                visibility: formValues.isVisible ? 'PUBLIC' : 'UNLISTED',
                locale,
                templateKey: templateKey || null,
            }),
        )

        useGuidanceArticleMutationMock.mockReturnValue({
            updateGuidanceArticle: jest.fn().mockResolvedValue({
                translation: {
                    article_id: 1,
                    title: 'Updated',
                    content: 'Content',
                },
            }),
            createGuidanceArticle: jest.fn().mockResolvedValue({
                translation: {
                    article_id: 1,
                    title: 'New',
                    content: 'Content',
                },
            }),
            deleteGuidanceArticle: jest.fn().mockResolvedValue(undefined),
            isGuidanceArticleUpdating: false,
        })

        useKnowledgeSourceSideBarMock.mockReturnValue({
            openPreview: jest.fn(),
            closeModal: jest.fn(),
            selectedResource: {},
        })

        useGuidanceAiSuggestionsMock.mockReturnValue({
            guidanceArticles: [],
            isLoadingAiGuidances: false,
            isLoadingGuidanceArticleList: false,
        })

        useAiAgentOnboardingNotificationMock.mockReturnValue({
            isLoading: false,
            handleOnTriggerActivateAiAgentNotification: jest.fn(),
        })
    })

    it('renders the form and updates input fields', () => {
        render(<ManageGuidanceForm {...baseProps} />)

        const nameInput = screen.getByTestId('name-input')
        const contentEditor = screen.getByTestId('editor')

        fireEvent.change(nameInput, { target: { value: 'Shipping Info' } })
        fireEvent.change(contentEditor, {
            target: { value: 'We ship worldwide.' },
        })

        expect(nameInput).toHaveValue('Shipping Info')
        expect(contentEditor).toHaveValue('We ship worldwide.')
    })

    it('disables save button when fields are empty', () => {
        render(<ManageGuidanceForm {...baseProps} />)

        const saveButton = screen.getByRole('button', {
            name: /create guidance/i,
        })

        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('enables save button when both fields are filled', () => {
        render(<ManageGuidanceForm {...baseProps} />)

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'Returns' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'You may return items in 30 days.' },
        })

        const saveButton = screen.getByRole('button', {
            name: /create guidance/i,
        })
        expect(saveButton).toHaveAttribute('aria-disabled', 'false')
    })

    it('submits form successfully', async () => {
        render(<ManageGuidanceForm {...baseProps} />)

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'FAQ' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'Helpful content here.' },
        })

        const saveButton = screen.getByRole('button', {
            name: /create guidance/i,
        })
        fireEvent.click(saveButton)

        expect(saveButton).toHaveAttribute('aria-disabled', 'false')
    })

    it('confirms and triggers delete', async () => {
        const guidanceProps = {
            ...baseProps,
            guidance: mockGuidanceArticle,
        }

        render(<ManageGuidanceForm {...guidanceProps} />)

        expect(
            screen.queryByText(/Are you sure you want to delete/i),
        ).not.toBeInTheDocument()

        const deleteBtn = screen.getByRole('button', {
            name: /delete guidance/i,
        })
        fireEvent.click(deleteBtn)

        await waitFor(() => {
            expect(
                screen.getByText(/Are you sure you want to delete/i),
            ).toBeInTheDocument()
        })

        const confirmDeleteBtn = screen.getByText('Delete')
        fireEvent.click(confirmDeleteBtn)

        await waitFor(() => {
            expect(
                screen.queryByText(/Are you sure you want to delete/i),
            ).not.toBeInTheDocument()
        })
    })

    it('should open UnsavedChangesModal when before closing when form is dirty', async () => {
        const openUnsavedChangesModalMock = jest.fn()

        useUnsavedChangesModalMock.mockReturnValue({
            isOpen: false,
            openUnsavedChangesModal: openUnsavedChangesModalMock,
            closeUnsavedChangesModal: jest.fn(),
            setHasUnsavedChangesRef: jest.fn(),
        })

        render(<ManageGuidanceForm {...baseProps} />)

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'FAQ' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'Helpful content here.' },
        })

        const closeButton = screen.getByText('Cancel')
        fireEvent.click(closeButton)

        expect(openUnsavedChangesModalMock).toHaveBeenCalled()
    })

    it('should handle discard changes within UnsavedChangesModal and reset form', async () => {
        const closeUnsavedChangesModalMock = jest.fn()
        const closeModalMock = jest.fn()
        useUnsavedChangesModalMock.mockReturnValue({
            isOpen: true,
            closeUnsavedChangesModal: closeUnsavedChangesModalMock,
            setHasUnsavedChangesRef: jest.fn(),
        })

        useKnowledgeSourceSideBarMock.mockReturnValue({
            closeModal: closeModalMock,
        })

        render(<ManageGuidanceForm {...baseProps} />)

        expect(screen.getByTestId('name-input')).toHaveValue('')

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'FAQ' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'Helpful content here.' },
        })

        fireEvent.click(screen.getByText('Discard'))

        expect(closeUnsavedChangesModalMock).toHaveBeenCalled()
        expect(closeModalMock).toHaveBeenCalled()
        expect(screen.getByTestId('name-input')).toHaveValue('')
        expect(screen.getByTestId('editor')).toHaveValue('')
    })

    it('should handle save changes within UnsavedChangesModal', async () => {
        const closeUnsavedChangesModalMock = jest.fn()
        const createGuidanceArticleMock = jest.fn().mockResolvedValue({
            translation: {
                article_id: 1,
                title: 'New',
                content: 'Content',
            },
        })
        useUnsavedChangesModalMock.mockReturnValue({
            isOpen: true,
            closeUnsavedChangesModal: closeUnsavedChangesModalMock,
            setHasUnsavedChangesRef: jest.fn(),
        })

        useGuidanceArticleMutationMock.mockReturnValue({
            createGuidanceArticle: createGuidanceArticleMock,
        })

        render(<ManageGuidanceForm {...baseProps} />)

        expect(screen.getByTestId('name-input')).toHaveValue('')

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'test' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'test content here.' },
        })

        fireEvent.click(screen.getByText('Save'))

        expect(closeUnsavedChangesModalMock).toHaveBeenCalled()
        expect(createGuidanceArticleMock).toHaveBeenCalledWith({
            content: 'test content here.',
            locale: 'en',
            templateKey: null,
            title: 'test',
            visibility: 'PUBLIC',
        })
    })

    it('should handle keep editing changes within UnsavedChangesModal and preserve form values', async () => {
        const closeUnsavedChangesModalMock = jest.fn()
        useUnsavedChangesModalMock.mockReturnValue({
            isOpen: true,
            closeUnsavedChangesModal: closeUnsavedChangesModalMock,
            setHasUnsavedChangesRef: jest.fn(),
        })

        render(<ManageGuidanceForm {...baseProps} />)

        expect(screen.getByTestId('name-input')).toHaveValue('')

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'Some test title' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'Some content here.' },
        })

        fireEvent.click(screen.getByText('Back To Editing'))

        expect(closeUnsavedChangesModalMock).toHaveBeenCalled()
        expect(screen.getByTestId('name-input')).toHaveValue('Some test title')
        expect(screen.getByTestId('editor')).toHaveValue('Some content here.')
    })

    it('should update guidance ', async () => {
        const openPreviewMock = jest.fn()
        const dispatchMock = jest.fn()
        const handleOnTriggerActivateAiAgentNotificationMock = jest.fn()
        useGuidanceAiSuggestionsMock.mockReturnValue({
            guidanceArticles: mockGuidanceArticlesList,
            isLoadingAiGuidances: false,
            isLoadingGuidanceArticleList: false,
        })
        useGuidanceArticleMutationMock.mockReturnValue({
            updateGuidanceArticle: jest.fn().mockResolvedValue({
                article_id: 1,
                title: 'Updated',
                content: 'Content',
            }),
        })
        useAiAgentOnboardingNotificationMock.mockReturnValue({
            handleOnTriggerActivateAiAgentNotification:
                handleOnTriggerActivateAiAgentNotificationMock,
        })
        useKnowledgeSourceSideBarMock.mockReturnValue({
            openPreview: openPreviewMock,
        })
        useAppDispatchMock.mockReturnValue(dispatchMock)

        const guidanceProps = {
            ...baseProps,
            guidance: mockGuidanceArticle,
        }

        render(<ManageGuidanceForm {...guidanceProps} />)

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'Updated' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'Content' },
        })

        const saveButton = screen.getByRole('button', {
            name: /save changes/i,
        })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalled()
            expect(
                handleOnTriggerActivateAiAgentNotificationMock,
            ).toHaveBeenCalled()
            expect(openPreviewMock).toHaveBeenCalledWith({
                content: 'Content',
                helpCenterId: '1',
                id: '1',
                title: 'Updated',
                knowledgeResourceType: 'GUIDANCE',
                url: '/guidance/1',
            })
        })
    })

    it('should fallback empty strings on update if newGuidance is not returnd ', async () => {
        const openPreviewMock = jest.fn()
        const dispatchMock = jest.fn()
        const handleOnTriggerActivateAiAgentNotificationMock = jest.fn()
        useGuidanceAiSuggestionsMock.mockReturnValue({
            guidanceArticles: mockGuidanceArticlesList,
            isLoadingAiGuidances: false,
            isLoadingGuidanceArticleList: false,
        })
        useGuidanceArticleMutationMock.mockReturnValue({
            updateGuidanceArticle: jest.fn().mockResolvedValue(null),
        })
        useAiAgentOnboardingNotificationMock.mockReturnValue({
            handleOnTriggerActivateAiAgentNotification:
                handleOnTriggerActivateAiAgentNotificationMock,
        })
        useKnowledgeSourceSideBarMock.mockReturnValue({
            openPreview: openPreviewMock,
        })
        useAppDispatchMock.mockReturnValue(dispatchMock)

        const guidanceProps = {
            ...baseProps,
            guidance: mockGuidanceArticle,
        }

        render(<ManageGuidanceForm {...guidanceProps} />)

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'Updated' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'Content' },
        })

        const saveButton = screen.getByRole('button', {
            name: /save changes/i,
        })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(dispatchMock).toHaveBeenCalled()
            expect(
                handleOnTriggerActivateAiAgentNotificationMock,
            ).toHaveBeenCalled()
            expect(openPreviewMock).toHaveBeenCalledWith({
                content: '',
                helpCenterId: '1',
                id: '',
                title: '',
                knowledgeResourceType: 'GUIDANCE',
                url: '/guidance/1',
            })
        })
    })

    it('should call openPreview if close button is clicked while editing', async () => {
        const openPreviewMock = jest.fn()
        useKnowledgeSourceSideBarMock.mockReturnValue({
            openPreview: openPreviewMock,
        })

        const guidanceProps = {
            ...baseProps,
            guidance: mockGuidanceArticle,
        }

        render(<ManageGuidanceForm {...guidanceProps} />)

        const closeButton = screen.getByText('keyboard_tab')
        fireEvent.click(closeButton)

        expect(openPreviewMock).toHaveBeenCalled()
    })

    it('should call onClose if close button is clicked while creating', async () => {
        const closeModalMock = jest.fn()
        useKnowledgeSourceSideBarMock.mockReturnValue({
            closeModal: closeModalMock,
        })

        render(<ManageGuidanceForm {...baseProps} />)

        const closeButton = screen.getByText('keyboard_tab')
        fireEvent.click(closeButton)

        expect(closeModalMock).toHaveBeenCalled()
    })

    it('should show the missing knowledge checkbox when creating guidance', () => {
        render(<ManageGuidanceForm {...baseProps} />)

        const checkbox = screen.getByText('Use in similar requests')
        expect(checkbox).toBeInTheDocument()
    })

    it('should hide the missing knowledge checkbox when editing guidance', () => {
        const guidanceProps = {
            ...baseProps,
            guidance: mockGuidanceArticle,
        }

        render(<ManageGuidanceForm {...guidanceProps} />)

        const checkbox = screen.queryByText('Use in similar requests')
        expect(checkbox).not.toBeInTheDocument()
    })

    it('should call onSubmitNewMissingKnowledge when checkbox is checked and form is submitted', async () => {
        const createGuidanceArticleMock = jest.fn().mockResolvedValue({
            translation: {
                article_id: 123,
                title: 'New Guidance',
                content: 'Guidance content',
            },
        })

        useGuidanceArticleMutationMock.mockReturnValue({
            createGuidanceArticle: createGuidanceArticleMock,
            isGuidanceArticleUpdating: false,
        })

        render(<ManageGuidanceForm {...baseProps} />)

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'Test Guidance' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'Test content' },
        })

        const checkbox = screen.getByLabelText('Use in similar requests')
        expect(checkbox).toBeChecked()

        const saveButton = screen.getByRole('button', {
            name: /create guidance/i,
        })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(onSubmitNewMissingKnowledgeMock).toHaveBeenCalledWith({
                resourceId: '123',
                resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                resourceSetId: '1',
                resourceLocale: 'en',
            })
        })
    })

    it('should not call onSubmitNewMissingKnowledge when checkbox is unchecked', async () => {
        const createGuidanceArticleMock = jest.fn().mockResolvedValue({
            translation: {
                article_id: 123,
                title: 'New Guidance',
                content: 'Guidance content',
            },
        })

        useGuidanceArticleMutationMock.mockReturnValue({
            createGuidanceArticle: createGuidanceArticleMock,
            isGuidanceArticleUpdating: false,
        })

        render(<ManageGuidanceForm {...baseProps} />)

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'Test Guidance' },
        })
        fireEvent.change(screen.getByTestId('editor'), {
            target: { value: 'Test content' },
        })

        const checkbox = screen.getByLabelText('Use in similar requests')
        fireEvent.click(checkbox)
        expect(checkbox).not.toBeChecked()

        const saveButton = screen.getByRole('button', {
            name: /create guidance/i,
        })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(createGuidanceArticleMock).toHaveBeenCalled()
        })

        expect(onSubmitNewMissingKnowledgeMock).not.toHaveBeenCalled()
    })

    it('should not call onSubmitNewMissingKnowledge when editing existing guidance', async () => {
        const updateGuidanceArticleMock = jest.fn().mockResolvedValue({
            article_id: 1,
            title: 'Updated',
            content: 'Content',
        })

        useGuidanceArticleMutationMock.mockReturnValue({
            updateGuidanceArticle: updateGuidanceArticleMock,
            isGuidanceArticleUpdating: false,
        })

        const guidanceProps = {
            ...baseProps,
            guidance: mockGuidanceArticle,
        }

        render(<ManageGuidanceForm {...guidanceProps} />)

        fireEvent.change(screen.getByTestId('name-input'), {
            target: { value: 'Updated Guidance' },
        })

        const saveButton = screen.getByRole('button', {
            name: /save changes/i,
        })
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(updateGuidanceArticleMock).toHaveBeenCalled()
        })

        expect(onSubmitNewMissingKnowledgeMock).not.toHaveBeenCalled()
    })

    describe('Error Handling', () => {
        const mockDispatch = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            mockDispatch.mockClear()
            useAppDispatchMock.mockReturnValue(mockDispatch)

            mockNotify.mockImplementation(
                (notification) =>
                    ({
                        type: 'NOTIFY',
                        ...notification,
                    }) as any,
            )
            mockOnApiError.mockReturnValue((dispatch: any) => {
                dispatch({ type: 'API_ERROR' })
            })

            useGuidanceArticleMutationMock.mockReturnValue({
                createGuidanceArticle: jest.fn(),
                updateGuidanceArticle: jest.fn(),
                deleteGuidanceArticle: jest.fn(),
                isGuidanceArticleUpdating: false,
                isGuidanceArticleDeleting: false,
            })
        })

        it('handles duplicate title error correctly for update', async () => {
            const error = {
                response: {
                    data: {
                        error: {
                            msg: 'An article with the title "Updated Title" already exists in this help center',
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
                        'Guidance with the name "Updated Title" already exists in this help center',
                },
            })

            useGuidanceArticleMutationMock.mockReturnValue({
                updateGuidanceArticle: jest.fn().mockRejectedValue(error),
                isGuidanceArticleUpdating: false,
                isGuidanceArticleDeleting: false,
            })

            render(
                <ManageGuidanceForm
                    shopName="Demo"
                    shopType="shopify"
                    helpCenter={helpCenter}
                    onSubmitNewMissingKnowledge={
                        onSubmitNewMissingKnowledgeMock
                    }
                    guidance={{
                        id: 1,
                        title: 'Original Title',
                        content: 'Original Content',
                        visibility: 'PUBLIC',
                        locale: 'en-US',
                        lastUpdated: '2023-10-01T00:00:00Z',
                        templateKey: '',
                    }}
                />,
            )

            fireEvent.change(screen.getByTestId('name-input'), {
                target: { value: 'Updated Title' },
            })

            const submitButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockHandleGuidanceDuplicateError).toHaveBeenCalledWith(
                error,
                'Updated Title',
            )

            expect(mockNotify).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message:
                    'Guidance with the name "Updated Title" already exists in this help center',
            })
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

            useGuidanceArticleMutationMock.mockReturnValue({
                updateGuidanceArticle: jest.fn().mockRejectedValue(error),
                isGuidanceArticleUpdating: false,
                isGuidanceArticleDeleting: false,
            })

            render(
                <ManageGuidanceForm
                    shopName="Demo"
                    shopType="shopify"
                    helpCenter={helpCenter}
                    onSubmitNewMissingKnowledge={
                        onSubmitNewMissingKnowledgeMock
                    }
                    guidance={{
                        id: 1,
                        title: 'Original Title',
                        content: 'Original Content',
                        visibility: 'PUBLIC',
                        locale: 'en-US',
                        lastUpdated: '2023-10-01T00:00:00Z',
                        templateKey: '',
                    }}
                />,
            )

            // Update content to trigger duplicate error
            fireEvent.change(screen.getByTestId('editor'), {
                target: { value: 'Duplicate Content' },
            })

            // Submit form
            const submitButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockHandleGuidanceDuplicateError).toHaveBeenCalledWith(
                error,
                'Original Title',
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

        it('falls back to default error handling when no error message is present', async () => {
            const error = {
                response: {
                    data: {},
                },
            }

            mockHandleGuidanceDuplicateError.mockReturnValue({
                isDuplicate: false,
            })

            useGuidanceArticleMutationMock.mockReturnValue({
                updateGuidanceArticle: jest.fn().mockRejectedValue(error),
                isGuidanceArticleUpdating: false,
                isGuidanceArticleDeleting: false,
            })

            render(
                <ManageGuidanceForm
                    shopName="Demo"
                    shopType="shopify"
                    helpCenter={helpCenter}
                    onSubmitNewMissingKnowledge={
                        onSubmitNewMissingKnowledgeMock
                    }
                    guidance={{
                        id: 1,
                        title: 'Test Title',
                        content: 'Test Content',
                        visibility: 'PUBLIC',
                        locale: 'en-US',
                        lastUpdated: '2023-10-01T00:00:00Z',
                        templateKey: '',
                    }}
                />,
            )

            fireEvent.change(screen.getByTestId('name-input'), {
                target: { value: 'Updated Title' },
            })

            const submitButton = screen.getByRole('button', {
                name: /save changes/i,
            })
            fireEvent.click(submitButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled()
            })

            expect(mockHandleGuidanceDuplicateError).toHaveBeenCalledWith(
                error,
                'Updated Title',
            )

            expect(mockOnApiError).toHaveBeenCalledWith(
                error,
                'Error during guidance article update.',
            )
            expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
        })
    })
})
