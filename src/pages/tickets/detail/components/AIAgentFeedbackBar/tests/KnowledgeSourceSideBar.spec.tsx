import { fireEvent, render, screen } from '@testing-library/react'

import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { useUnsavedChangesModal } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'

import KnowledgeSourceSideBar from '../KnowledgeSourceSideBar'

jest.mock('pages/common/components/Drawer', () => ({
    Drawer: ({ onBackdropClick, children }: any) => (
        <div data-testid="mock-drawer">
            <div data-testid="mock-backdrop" onClick={onBackdropClick}>
                Backdrop
            </div>
            {children}
        </div>
    ),
}))

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePreview',
    () => ({
        __esModule: true,
        default: ({ lastUpdatedAt, onClose, onEdit }: any) => (
            <div data-testid="mock-preview">
                Preview - Last updated: {lastUpdatedAt}
                <button onClick={onClose}>Close</button>
                <button onClick={onEdit}>Edit</button>
            </div>
        ),
    }),
)

jest.mock('../ManageGuidanceForm', () => ({
    ManageGuidanceForm: ({ url }: any) => (
        <div data-testid="mock-manage-guidance">
            Manage Guidance - URL: {url}
        </div>
    ),
}))

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
    () => ({
        useKnowledgeSourceSideBar: jest.fn(),
    }),
)

const useKnowledgeSourceSideBarMock = useKnowledgeSourceSideBar as jest.Mock

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider',
)

const useUnsavedChangesModalMock = useUnsavedChangesModal as jest.Mock

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(() => ({ name: 'mock-help-center' })),
}))

const baseProps = {
    articles: [{ id: 1, updated_datetime: '2023-01-01T00:00:00Z' }] as any,
    guidanceArticles: [{ id: 2, lastUpdated: '2023-01-02T00:00:00Z' }] as any,
    shopName: 'Shop A',
    shopType: 'Retail',
}

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')

const useCurrentHelpCenterMock = useCurrentHelpCenter as jest.Mock
describe('KnowledgeSourceSideBar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        useCurrentHelpCenterMock.mockReturnValue({
            name: 'Test Help Center',
        })
    })

    it('renders preview mode when selectedResource is present', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: {
                id: 1,
                knowledgeResourceType: 'HELP_CENTER',
                url: 'http://test.com',
            },
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: jest.fn(),
            openEdit: jest.fn(),
        })

        useUnsavedChangesModalMock.mockReturnValue({
            getHasUnsavedChanges: jest.fn(() => false),
            openUnsavedChangesModal: jest.fn(),
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.getByTestId('mock-preview')).toBeInTheDocument()
        expect(screen.getByTestId('mock-drawer')).toBeInTheDocument()
    })

    it('renders manage mode for guidance article', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: {
                id: 2,
                knowledgeResourceType: 'GUIDANCE',
                url: 'http://test.com',
            },
            mode: KnowledgeSourceSideBarMode.EDIT,
            closeModal: jest.fn(),
            openEdit: jest.fn(),
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.getByTestId('mock-manage-guidance')).toBeInTheDocument()
    })

    it('does not render preview or manage form if mode is undefined', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: null,
            mode: undefined,
            closeModal: jest.fn(),
            openEdit: jest.fn(),
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.queryByTestId('mock-preview')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('mock-manage-guidance'),
        ).not.toBeInTheDocument()
    })

    it('calls closeModal on backdrop click if there are no unsaved changes', () => {
        const closeModal = jest.fn()

        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: {
                id: 1,
                knowledgeResourceType: 'HELP_CENTER',
                url: 'https://test.com',
            },
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal,
            openEdit: jest.fn(),
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        fireEvent.click(screen.getByTestId('mock-backdrop'))

        expect(closeModal).toHaveBeenCalled()
    })

    it('opens unsaved changes modal instead of closing if there are unsaved changes', () => {
        const openUnsavedChangesModal = jest.fn()

        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: {
                id: 1,
                knowledgeResourceType: 'HELP_CENTER',
                url: 'https://test.com',
            },
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: jest.fn(),
            openEdit: jest.fn(),
        })

        useUnsavedChangesModalMock.mockReturnValue({
            getHasUnsavedChanges: jest.fn(() => true),
            openUnsavedChangesModal,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        fireEvent.click(screen.getByTestId('mock-backdrop'))

        expect(openUnsavedChangesModal).toHaveBeenCalled()
    })
})
