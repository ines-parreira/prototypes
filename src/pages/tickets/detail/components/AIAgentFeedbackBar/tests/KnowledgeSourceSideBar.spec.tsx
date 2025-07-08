import { fireEvent, render, screen } from '@testing-library/react'

import { getArticleFixture } from 'pages/aiAgent/fixtures/article.fixture'
import { HelpCenterArticleModalView } from 'pages/settings/helpCenter/components/articles/HelpCenterEditArticleModalContent/types'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useAbilityChecker } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { useUnsavedChangesModal } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'

import KnowledgeSourceSideBar from '../KnowledgeSourceSideBar'
import { AiAgentKnowledgeResourceTypeEnum } from '../types'

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

jest.mock('../KnowledgeSourceArticleEditor', () => ({
    __esModule: true,
    default: ({ article, isCreateMode, onClose }: any) => (
        <div data-testid="mock-article-editor">
            <div>Mode: {isCreateMode ? 'CREATE' : 'EDIT'}</div>
            <div>Article ID: {article?.id || 'none'}</div>
            <button onClick={onClose}>Close Editor</button>
        </div>
    ),
}))

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
    () => ({
        useKnowledgeSourceSideBar: jest.fn(),
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider',
)

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(() => ({ name: 'mock-help-center' })),
}))

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')

jest.mock('pages/settings/helpCenter/providers/EditionManagerContext', () => ({
    useEditionManager: jest.fn(),
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: jest.fn(),
}))

const useKnowledgeSourceSideBarMock = useKnowledgeSourceSideBar as jest.Mock
const useUnsavedChangesModalMock = useUnsavedChangesModal as jest.Mock
const useCurrentHelpCenterMock = useCurrentHelpCenter as jest.Mock
const useEditionManagerMock = useEditionManager as jest.Mock
const useAbilityCheckerMock = useAbilityChecker as jest.Mock

describe('KnowledgeSourceSideBar', () => {
    const testArticle = {
        ...getArticleFixture(1, {
            updated_datetime: '2023-01-01T00:00:00Z',
        }),
        helpCenterId: 1,
    }

    const baseProps = {
        articles: [testArticle],
        guidanceArticles: [
            { id: 2, lastUpdated: '2023-01-02T00:00:00Z' },
        ] as any,
        shopName: 'Shop A',
        shopType: 'Retail',
        onSubmitNewMissingKnowledge: jest.fn(),
    }

    const mockCloseModal = jest.fn()
    const mockOpenEdit = jest.fn()
    const mockSetEditModal = jest.fn()
    const mockGetHasUnsavedChanges = jest.fn(() => false)
    const mockOpenUnsavedChangesModal = jest.fn()
    const mockIsPassingRulesCheck = jest.fn()

    const helpCenterResource = {
        id: 1,
        knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        url: 'http://test.com',
    }

    const guidanceResource = {
        id: 2,
        knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
        url: 'http://test.com',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockIsPassingRulesCheck.mockImplementation((callback) => {
            const mockCan = jest.fn(() => true)
            return callback({ can: mockCan })
        })

        useCurrentHelpCenterMock.mockReturnValue({
            name: 'Test Help Center',
        })

        useEditionManagerMock.mockReturnValue({
            setEditModal: mockSetEditModal,
        })

        useAbilityCheckerMock.mockReturnValue({
            isPassingRulesCheck: mockIsPassingRulesCheck,
        })

        useUnsavedChangesModalMock.mockReturnValue({
            getHasUnsavedChanges: mockGetHasUnsavedChanges,
            openUnsavedChangesModal: mockOpenUnsavedChangesModal,
        })

        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: null,
            mode: undefined,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })
    })

    it('renders preview mode when selectedResource is present', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.getByText('Preview - Last updated: 2023-01-01T00:00:00Z'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('mock-drawer')).toBeInTheDocument()
    })

    it('renders manage mode for guidance article', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: guidanceResource,
            mode: KnowledgeSourceSideBarMode.EDIT,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.getByText('Manage Guidance - URL: http://test.com'),
        ).toBeInTheDocument()
    })

    it('renders article editor in create mode for articles when user has permission', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.CREATE,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.getByTestId('mock-article-editor')).toBeInTheDocument()
        expect(screen.getByText('Mode: CREATE')).toBeInTheDocument()
        expect(screen.getByText('Article ID: 1')).toBeInTheDocument()
    })

    it('renders article editor in edit mode for articles when user has permission', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.EDIT,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.getByTestId('mock-article-editor')).toBeInTheDocument()
        expect(screen.getByText('Mode: EDIT')).toBeInTheDocument()
        expect(screen.getByText('Article ID: 1')).toBeInTheDocument()
    })

    it('does not render article editor when user lacks update permission', () => {
        mockIsPassingRulesCheck.mockImplementation((callback) => {
            const mockCan = jest.fn(() => false)
            return callback({ can: mockCan })
        })

        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.EDIT,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.queryByTestId('mock-article-editor'),
        ).not.toBeInTheDocument()
        expect(screen.getByTestId('mock-drawer')).toBeInTheDocument()
    })

    it('sets edit modal when article editor should display', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.CREATE,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(mockSetEditModal).toHaveBeenCalledWith({
            isOpened: true,
            view: HelpCenterArticleModalView.BASIC,
        })
    })

    it('handles article editor close callback properly', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.CREATE,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        fireEvent.click(screen.getByText('Close Editor'))

        expect(mockCloseModal).toHaveBeenCalled()
        expect(mockSetEditModal).toHaveBeenCalledWith({
            isOpened: false,
            view: null,
        })
    })

    it('renders article editor for create mode with no existing article', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: {
                id: 999, // Non-existent article ID
                knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                url: 'http://test.com',
            },
            mode: KnowledgeSourceSideBarMode.CREATE,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.getByTestId('mock-article-editor')).toBeInTheDocument()
        expect(screen.getByText('Mode: CREATE')).toBeInTheDocument()
        expect(screen.getByText('Article ID: none')).toBeInTheDocument()
    })

    it('does not render preview or manage form if mode is undefined', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: null,
            mode: undefined,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.queryByTestId('mock-preview')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('mock-manage-guidance'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('mock-article-editor'),
        ).not.toBeInTheDocument()
    })

    it('calls closeModal on backdrop click if there are no unsaved changes', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        fireEvent.click(screen.getByTestId('mock-backdrop'))

        expect(mockCloseModal).toHaveBeenCalled()
        expect(mockOpenUnsavedChangesModal).not.toHaveBeenCalled()
    })

    it('opens unsaved changes modal instead of closing if there are unsaved changes', () => {
        mockGetHasUnsavedChanges.mockReturnValue(true)

        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        fireEvent.click(screen.getByTestId('mock-backdrop'))

        expect(mockOpenUnsavedChangesModal).toHaveBeenCalled()
        expect(mockCloseModal).not.toHaveBeenCalled()
    })

    it('displays correct last updated date from guidance article', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: guidanceResource,
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.getByText('Preview - Last updated: 2023-01-02T00:00:00Z'),
        ).toBeInTheDocument()
    })
})
