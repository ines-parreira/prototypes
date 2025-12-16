import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'

import type { InitialArticleModeValue } from './context'
import { KnowledgeEditorHelpCenterArticle } from './KnowledgeEditorHelpCenterArticle'

jest.mock('@gorgias/axiom', () => ({
    SidePanel: ({
        isOpen,
        onOpenChange,
        children,
    }: {
        isOpen: boolean
        onOpenChange: (open: boolean) => void
        children: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="side-panel" data-is-open={isOpen}>
                <button
                    data-testid="close-panel-button"
                    onClick={() => onOpenChange(false)}
                >
                    Close
                </button>
                {children}
            </div>
        ) : null,
    LegacyLoadingSpinner: () => (
        <div data-testid="loading-spinner">Loading</div>
    ),
}))

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterArticle: jest.fn(() => ({
        data: {
            id: 1,
            translation: {
                title: 'Test Article',
                content: 'Test Content',
                locale: 'en-US',
            },
        },
        isLoading: false,
    })),
}))

jest.mock('./ArticleEditorContent', () => ({
    ArticleEditorContent: ({
        closeHandlerRef,
    }: {
        closeHandlerRef: React.MutableRefObject<(() => void) | null>
    }) => {
        return (
            <div data-testid="article-editor-content">
                <button
                    onClick={() => {
                        if (closeHandlerRef.current) {
                            closeHandlerRef.current()
                        }
                    }}
                >
                    Close Editor
                </button>
            </div>
        )
    },
}))

jest.mock('./context', () => {
    const actual = jest.requireActual('./context')
    return {
        ...actual,
        ArticleContextProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => <div data-testid="article-context-provider">{children}</div>,
        useArticleContext: () => ({
            playground: {
                isOpen: false,
                onTest: jest.fn(),
                onClose: jest.fn(),
                sidePanelWidth: '60vw',
            },
            config: {
                onClose: jest.fn(),
            },
        }),
    }
})

jest.mock('../../PlaygroundPanel/PlaygroundPanel', () => ({
    PlaygroundPanel: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="playground-panel">
            <button onClick={onClose}>Close Playground</button>
        </div>
    ),
}))

describe('KnowledgeEditorHelpCenterArticle', () => {
    const baseProps = {
        helpCenter: getHelpCentersResponseFixture.data[0],
        locales: getLocalesResponseFixture,
        categories: [],
        onClickPrevious: () => {},
        onClickNext: () => {},
        onClose: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders existing article with ArticleEditorContent', () => {
        render(
            <KnowledgeEditorHelpCenterArticle
                {...baseProps}
                article={{
                    type: 'existing',
                    initialArticleMode: 'read' as InitialArticleModeValue,
                    articleId: 1,
                }}
            />,
        )

        expect(
            screen.getByTestId('article-context-provider'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('article-editor-content')).toBeInTheDocument()
    })

    it('renders new article with ArticleEditorContent', () => {
        render(
            <KnowledgeEditorHelpCenterArticle
                {...baseProps}
                article={{
                    type: 'new',
                    template: {
                        title: 'Test Article',
                        content: 'Test Content',
                        key: 'test-template',
                    },
                    onCreated: () => {},
                }}
            />,
        )

        expect(
            screen.getByTestId('article-context-provider'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('article-editor-content')).toBeInTheDocument()
    })

    it('shows loading spinner while fetching existing article', () => {
        const mockUseGetHelpCenterArticle = jest.requireMock(
            'models/helpCenter/queries',
        ).useGetHelpCenterArticle
        mockUseGetHelpCenterArticle.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        render(
            <KnowledgeEditorHelpCenterArticle
                {...baseProps}
                article={{
                    type: 'existing',
                    initialArticleMode: 'read' as InitialArticleModeValue,
                    articleId: 1,
                }}
            />,
        )

        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    describe('SidePanel onOpenChange', () => {
        it('can close panel for existing article', async () => {
            const user = userEvent.setup()

            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleModeValue,
                        articleId: 1,
                    }}
                />,
            )

            expect(screen.getByTestId('side-panel')).toBeInTheDocument()

            const closeButton = screen.getByTestId('close-panel-button')
            await act(() => user.click(closeButton))
        })

        it('can close panel for new article', async () => {
            const user = userEvent.setup()

            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseProps}
                    article={{
                        type: 'new',
                        template: {
                            title: 'Test Article',
                            content: 'Test Content',
                            key: 'test-template',
                        },
                        onCreated: () => {},
                    }}
                />,
            )

            expect(screen.getByTestId('side-panel')).toBeInTheDocument()

            const closeButton = screen.getByTestId('close-panel-button')
            await act(() => user.click(closeButton))
        })
    })
})
