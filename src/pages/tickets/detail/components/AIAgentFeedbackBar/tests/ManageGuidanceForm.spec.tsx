import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { useGuidanceAiSuggestions } from 'pages/aiAgent/hooks/useGuidanceAiSuggestions'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { useUnsavedChangesModal } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'
import { assumeMock } from 'utils/testing'

import { useKnowledgeSourceSideBar } from '../hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { ManageGuidanceForm } from '../ManageGuidanceForm'

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
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
        />
    ),
}))

jest.mock('pages/aiAgent/components/GuidanceEditor/NewGuidanceEditor', () => ({
    NewGuidanceEditor: (props: any) => (
        <textarea
            data-testid="new-editor"
            value={props.value}
            onChange={(e) => props.handleUpdateContent(e.target.value)}
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

jest.mock('pages/common/components/Drawer', () => ({
    Drawer: {
        Header: ({ children }: any) => (
            <div data-testid="drawer-header">{children}</div>
        ),
        HeaderActions: ({ children }: any) => <div>{children}</div>,
        Content: ({ children }: any) => <div>{children}</div>,
        Footer: ({ children }: any) => <div>{children}</div>,
    },
}))

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

describe('ManageGuidanceForm', () => {
    const helpCenter = {
        id: 1,
        default_locale: 'en',
    } as any

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(jest.fn())
        useUnsavedChangesModalMock.mockReturnValue({
            isOpen: false,
            openUnsavedChangesModal: jest.fn(),
            closeUnsavedChangesModal: jest.fn(),
            setHasUnsavedChangesRef: jest.fn(),
        })

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
        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
            />,
        )

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
        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
            />,
        )

        const saveButton = screen.getByRole('button', {
            name: /create guidance/i,
        })

        expect(saveButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('enables save button when both fields are filled', () => {
        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
            />,
        )

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
        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
            />,
        )

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
        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
                guidance={{
                    id: 123,
                    title: 'Old title',
                    content: 'Old content',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                }}
            />,
        )

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

        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
            />,
        )

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

        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
            />,
        )

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

        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
            />,
        )

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

        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
            />,
        )

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
            guidanceArticles: [
                {
                    id: 1,
                    title: 'Old title1',
                    content: 'Old content1',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                },
                {
                    id: 2,
                    title: 'Old title2',
                    content: 'Old content2',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                },
                {
                    id: 3,
                    title: 'Old title3',
                    content: 'Old content3',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                },
            ],
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
        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
                guidance={{
                    id: 1,
                    title: 'Old title',
                    content: 'Old content',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                }}
            />,
        )

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
            guidanceArticles: [
                {
                    id: 1,
                    title: 'Old title1',
                    content: 'Old content1',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                },
                {
                    id: 2,
                    title: 'Old title2',
                    content: 'Old content2',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                },
                {
                    id: 3,
                    title: 'Old title3',
                    content: 'Old content3',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                },
            ],
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
        render(
            <ManageGuidanceForm
                shopName="Demo"
                shopType="shopify"
                helpCenter={helpCenter}
                guidance={{
                    id: 1,
                    title: 'Old title',
                    content: 'Old content',
                    visibility: 'PUBLIC',
                    locale: 'en-US',
                    lastUpdated: '2023-10-01T00:00:00Z',
                    templateKey: '',
                }}
            />,
        )

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
})
