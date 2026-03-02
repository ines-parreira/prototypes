import { fireEvent, render, screen } from '@testing-library/react'

import { getArticleFixture } from 'pages/aiAgent/fixtures/article.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

import KnowledgeSourceSideBar from '../KnowledgeSourceSideBar'
import { AiAgentKnowledgeResourceTypeEnum } from '../types'

jest.mock('pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor', () => ({
    KnowledgeEditor: (props: any) => {
        if (props.variant === 'guidance') {
            return (
                <div data-testid="mock-guidance-editor">
                    Guidance Editor - ID: {props.guidanceArticleId || 'none'} -
                    Mode: {props.guidanceMode}
                    <span data-testid="editor-open-state">
                        Open: {String(props.isOpen)}
                    </span>
                    {props.showMissingKnowledgeCheckbox && (
                        <span data-testid="show-missing-knowledge-checkbox">
                            Show Checkbox
                        </span>
                    )}
                    <button onClick={props.onClose}>Close</button>
                    {props.guidanceMode === 'create' && props.onCreate && (
                        <button onClick={() => props.onCreate()}>
                            Create Guidance
                        </button>
                    )}
                    {props.guidanceMode === 'create' && props.onCreate && (
                        <button
                            onClick={() =>
                                props.onCreate(
                                    { id: 11, locale: 'en-US' },
                                    true,
                                )
                            }
                        >
                            Create Guidance Metadata
                        </button>
                    )}
                    {props.guidanceMode === 'create' && props.onCreate && (
                        <button
                            onClick={() =>
                                props.onCreate(
                                    { id: 11, locale: 'en-US' },
                                    false,
                                )
                            }
                        >
                            Create Guidance Metadata Unchecked
                        </button>
                    )}
                    {props.onUpdate && (
                        <button onClick={() => props.onUpdate()}>
                            Update Guidance
                        </button>
                    )}
                    {props.onDelete && (
                        <button onClick={() => props.onDelete()}>
                            Delete Guidance
                        </button>
                    )}
                    {props.onEdit && (
                        <button onClick={() => props.onEdit()}>Edit</button>
                    )}
                </div>
            )
        }

        if (props.variant === 'article') {
            const { article } = props
            return (
                <div data-testid="mock-article-editor-hub">
                    Article Editor - ID: {article?.articleId || 'none'} - Type:{' '}
                    {article?.type}
                    <span data-testid="editor-open-state">
                        Open: {String(props.isOpen)}
                    </span>
                    {props.showMissingKnowledgeCheckbox && (
                        <span data-testid="show-missing-knowledge-checkbox">
                            Show Checkbox
                        </span>
                    )}
                    <button onClick={props.onClose}>Close</button>
                    {article?.type === 'new' && article?.onCreated && (
                        <button
                            onClick={() =>
                                article.onCreated({
                                    id: 1,
                                    help_center_id: 1,
                                    translation: { locale: 'en-US' },
                                })
                            }
                        >
                            Create Article
                        </button>
                    )}
                    {article?.type === 'new' && article?.onCreated && (
                        <button
                            onClick={() =>
                                article.onCreated(
                                    {
                                        id: 1,
                                        help_center_id: 1,
                                        translation: { locale: 'en-US' },
                                    },
                                    true,
                                )
                            }
                        >
                            Create Article Metadata
                        </button>
                    )}
                    {article?.type === 'new' && article?.onCreated && (
                        <button
                            onClick={() =>
                                article.onCreated(
                                    {
                                        id: 1,
                                        help_center_id: 1,
                                        translation: { locale: 'en-US' },
                                    },
                                    false,
                                )
                            }
                        >
                            Create Article Metadata Unchecked
                        </button>
                    )}
                    {article?.type === 'existing' && article?.onUpdated && (
                        <button onClick={() => article.onUpdated()}>
                            Update Article
                        </button>
                    )}
                    {article?.type === 'existing' && article?.onDeleted && (
                        <button onClick={() => article.onDeleted()}>
                            Delete Article
                        </button>
                    )}
                    {article?.onEdit && (
                        <button onClick={() => article.onEdit()}>Edit</button>
                    )}
                </div>
            )
        }

        return null
    },
}))

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
    () => ({
        useKnowledgeSourceSideBar: jest.fn(),
    }),
)

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')

const useKnowledgeSourceSideBarMock = useKnowledgeSourceSideBar as jest.Mock
const useCurrentHelpCenterMock = useCurrentHelpCenter as jest.Mock

describe('KnowledgeSourceSideBar', () => {
    const testArticle = {
        ...getArticleFixture(1, {
            updated_datetime: '2023-01-01T00:00:00Z',
        }),
        helpCenterId: 1,
    }

    const mockOnKnowledgeResourceEditClick = jest.fn()
    const mockOnKnowledgeResourceSaved = jest.fn()
    const mockOnSubmitNewMissingKnowledge = jest.fn()

    const baseProps = {
        articles: [testArticle],
        shopName: 'Shop A',
        shopType: 'Retail',
        onSubmitNewMissingKnowledge: mockOnSubmitNewMissingKnowledge,
        onKnowledgeResourceEditClick: mockOnKnowledgeResourceEditClick,
        onKnowledgeResourceSaved: mockOnKnowledgeResourceSaved,
    }

    const mockCloseModal = jest.fn()
    const mockOpenEdit = jest.fn()

    const helpCenterResource = {
        id: 1,
        knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        url: 'http://test.com',
        helpCenterId: 'help-center-1',
    }

    const guidanceResource = {
        id: 2,
        knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
        url: 'http://test.com',
        helpCenterId: 'help-center-1',
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockOnKnowledgeResourceEditClick.mockClear()
        mockOnKnowledgeResourceSaved.mockClear()
        mockOnSubmitNewMissingKnowledge.mockClear()

        useCurrentHelpCenterMock.mockReturnValue({
            name: 'Test Help Center',
            id: 1,
        })

        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: null,
            mode: undefined,
            isClosing: false,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })
    })

    it('renders Knowledge Hub article editor in preview mode for articles', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.getByTestId('mock-article-editor-hub'),
        ).toBeInTheDocument()
        expect(screen.getByText(/Article Editor - ID: 1/)).toBeInTheDocument()
    })

    it('renders Knowledge Hub guidance editor in preview mode for guidance', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: guidanceResource,
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.getByTestId('mock-guidance-editor')).toBeInTheDocument()
        expect(screen.getByText(/Guidance Editor - ID: 2/)).toBeInTheDocument()
    })

    it('renders Knowledge Hub article editor in create mode for articles', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.CREATE,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.getByTestId('mock-article-editor-hub'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/Article Editor - ID: none/),
        ).toBeInTheDocument()
        expect(screen.getByText(/Type: new/)).toBeInTheDocument()
    })

    it('renders Knowledge Hub guidance editor in create mode for guidance', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: guidanceResource,
            mode: KnowledgeSourceSideBarMode.CREATE,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.getByTestId('mock-guidance-editor')).toBeInTheDocument()
        expect(screen.getByText(/Mode: create/)).toBeInTheDocument()
    })

    it('does not render editors when selectedResource is null', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: null,
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.queryByTestId('mock-article-editor-hub'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('mock-guidance-editor'),
        ).not.toBeInTheDocument()
    })

    it('handles article editor close callback properly', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: helpCenterResource,
            mode: KnowledgeSourceSideBarMode.CREATE,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        fireEvent.click(screen.getByText('Close'))

        expect(mockCloseModal).toHaveBeenCalled()
    })

    it('renders Knowledge Hub article editor for create mode with no existing article', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: {
                id: 999,
                knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                url: 'http://test.com',
                helpCenterId: 'help-center-1',
            },
            mode: KnowledgeSourceSideBarMode.CREATE,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.getByTestId('mock-article-editor-hub'),
        ).toBeInTheDocument()
        expect(screen.getByText(/Type: new/)).toBeInTheDocument()
    })

    it('does not render editors if mode is undefined', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: null,
            mode: undefined,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(
            screen.queryByTestId('mock-guidance-editor'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('mock-article-editor-hub'),
        ).not.toBeInTheDocument()
    })

    it('passes isOpen=false to editor while sidebar is closing', () => {
        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: guidanceResource,
            mode: KnowledgeSourceSideBarMode.PREVIEW,
            isClosing: true,
            closeModal: mockCloseModal,
            openEdit: mockOpenEdit,
        })

        render(<KnowledgeSourceSideBar {...baseProps} />)

        expect(screen.getByText('Open: false')).toBeInTheDocument()
    })

    describe('when create button is clicked', () => {
        it('does not automatically close modal when creating guidance', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: guidanceResource,
                mode: KnowledgeSourceSideBarMode.CREATE,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            expect(
                screen.getByTestId('mock-guidance-editor'),
            ).toBeInTheDocument()
            expect(mockCloseModal).not.toHaveBeenCalled()
        })

        it('calls onKnowledgeResourceSaved when creating article', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: helpCenterResource,
                mode: KnowledgeSourceSideBarMode.CREATE,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Create Article'))

            expect(mockOnKnowledgeResourceSaved).toHaveBeenCalledWith(
                '1',
                'ARTICLE',
                '1',
                true,
            )
        })

        it('submits missing knowledge when creating guidance and checkbox is checked', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: guidanceResource,
                mode: KnowledgeSourceSideBarMode.CREATE,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Create Guidance Metadata'))

            expect(mockOnKnowledgeResourceSaved).toHaveBeenCalledWith(
                '11',
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                'help-center-1',
                true,
            )
            expect(mockOnSubmitNewMissingKnowledge).toHaveBeenCalledWith({
                resourceId: '11',
                resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                resourceSetId: 'help-center-1',
                resourceLocale: 'en-US',
            })
        })

        it('does not submit missing knowledge when creating guidance and checkbox is unchecked', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: guidanceResource,
                mode: KnowledgeSourceSideBarMode.CREATE,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(
                screen.getByText('Create Guidance Metadata Unchecked'),
            )

            expect(mockOnKnowledgeResourceSaved).toHaveBeenCalledWith(
                '11',
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                'help-center-1',
                true,
            )
            expect(mockOnSubmitNewMissingKnowledge).not.toHaveBeenCalled()
        })

        it('submits missing knowledge when creating article and checkbox is checked', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: helpCenterResource,
                mode: KnowledgeSourceSideBarMode.CREATE,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Create Article Metadata'))

            expect(mockOnSubmitNewMissingKnowledge).toHaveBeenCalledWith({
                resourceId: '1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceSetId: '1',
                resourceLocale: 'en-US',
            })
        })

        it('does not submit missing knowledge when creating article and checkbox is unchecked', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: helpCenterResource,
                mode: KnowledgeSourceSideBarMode.CREATE,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(
                screen.getByText('Create Article Metadata Unchecked'),
            )

            expect(mockOnSubmitNewMissingKnowledge).not.toHaveBeenCalled()
        })
    })

    describe('showMissingKnowledgeCheckbox prop', () => {
        it('passes showMissingKnowledgeCheckbox=true to guidance editor in create mode', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: guidanceResource,
                mode: KnowledgeSourceSideBarMode.CREATE,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            expect(
                screen.getByTestId('show-missing-knowledge-checkbox'),
            ).toBeInTheDocument()
        })

        it('passes showMissingKnowledgeCheckbox=true to article editor in create mode', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: helpCenterResource,
                mode: KnowledgeSourceSideBarMode.CREATE,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            expect(
                screen.getByTestId('show-missing-knowledge-checkbox'),
            ).toBeInTheDocument()
        })

        it('does not pass showMissingKnowledgeCheckbox to guidance editor in preview mode', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: guidanceResource,
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            expect(
                screen.queryByTestId('show-missing-knowledge-checkbox'),
            ).not.toBeInTheDocument()
        })

        it('does not pass showMissingKnowledgeCheckbox to article editor in preview mode', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: helpCenterResource,
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            expect(
                screen.queryByTestId('show-missing-knowledge-checkbox'),
            ).not.toBeInTheDocument()
        })
    })

    describe('edit callback handling', () => {
        it('calls onKnowledgeResourceEditClick when edit button is clicked in guidance preview', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: guidanceResource,
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Edit'))

            expect(mockOnKnowledgeResourceEditClick).toHaveBeenCalledWith(
                2,
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                'help-center-1',
            )
        })

        it('calls onKnowledgeResourceEditClick when edit button is clicked in article preview', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: helpCenterResource,
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Edit'))

            expect(mockOnKnowledgeResourceEditClick).toHaveBeenCalledWith(
                1,
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                'help-center-1',
            )
        })
    })

    describe('update callback handling', () => {
        it('calls onKnowledgeResourceSaved when guidance is updated', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: guidanceResource,
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Update Guidance'))

            expect(mockOnKnowledgeResourceSaved).toHaveBeenCalledWith(
                2,
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                'help-center-1',
                false,
            )
        })

        it('calls onKnowledgeResourceSaved when article is updated', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: helpCenterResource,
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Update Article'))

            expect(mockOnKnowledgeResourceSaved).toHaveBeenCalledWith(
                1,
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                'help-center-1',
                false,
            )
        })
    })

    describe('delete callback handling', () => {
        it('closes modal when guidance is deleted', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: guidanceResource,
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Delete Guidance'))

            expect(mockCloseModal).toHaveBeenCalled()
        })

        it('closes modal when article is deleted', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: helpCenterResource,
                mode: KnowledgeSourceSideBarMode.PREVIEW,
                closeModal: mockCloseModal,
                openEdit: mockOpenEdit,
            })

            render(<KnowledgeSourceSideBar {...baseProps} />)

            fireEvent.click(screen.getByText('Delete Article'))

            expect(mockCloseModal).toHaveBeenCalled()
        })
    })
})
