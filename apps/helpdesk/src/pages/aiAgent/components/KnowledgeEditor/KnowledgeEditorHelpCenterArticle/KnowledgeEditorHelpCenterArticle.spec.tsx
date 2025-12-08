import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'

import { KnowledgeEditorHelpCenterArticle } from './KnowledgeEditorHelpCenterArticle'
import type { InitialArticleMode } from './KnowledgeEditorHelpCenterExistingArticle'

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
}))

jest.mock('./KnowledgeEditorHelpCenterExistingArticle', () => ({
    KnowledgeEditorHelpCenterExistingArticle: ({
        isFullscreen,
        onToggleFullscreen,
        onTest,
    }: {
        isFullscreen: boolean
        onToggleFullscreen: () => void
        onTest: () => void
    }) => (
        <>
            <div>EXISTING ARTICLE</div>
            <button onClick={onToggleFullscreen}>
                {isFullscreen ? 'leave fullscreen' : 'fullscreen'}
            </button>
            <button onClick={onTest}>Test</button>
        </>
    ),
}))

jest.mock('./KnowledgeEditorHelpCenterNewArticle', () => ({
    KnowledgeEditorHelpCenterNewArticle: ({
        onTest,
    }: {
        onTest: () => void
    }) => (
        <>
            <div>NEW ARTICLE</div>
            <button onClick={onTest}>Test</button>
        </>
    ),
}))

jest.mock('../../PlaygroundPanel/PlaygroundPanel', () => ({
    PlaygroundPanel: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="playground-panel">
            <button onClick={onClose}>Close Playground</button>
        </div>
    ),
}))

describe('KnowledgeEditorHelpCenterArticle', () => {
    it('renders existing article', () => {
        render(
            <KnowledgeEditorHelpCenterArticle
                helpCenter={getHelpCentersResponseFixture.data[0]}
                locales={getLocalesResponseFixture}
                categories={[]}
                onClickPrevious={() => {}}
                onClickNext={() => {}}
                onClose={() => {}}
                article={{
                    type: 'existing',
                    initialArticleMode: 'read' as InitialArticleMode,
                    articleId: 1,
                }}
            />,
        )

        expect(screen.getByText('EXISTING ARTICLE')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'fullscreen' }))

        expect(
            screen.getByRole('button', { name: 'leave fullscreen' }),
        ).toBeInTheDocument()

        fireEvent.click(
            screen.getByRole('button', { name: 'leave fullscreen' }),
        )

        expect(
            screen.getByRole('button', { name: 'fullscreen' }),
        ).toBeInTheDocument()
    })

    it('renders new article', () => {
        render(
            <KnowledgeEditorHelpCenterArticle
                helpCenter={getHelpCentersResponseFixture.data[0]}
                locales={getLocalesResponseFixture}
                categories={[]}
                onClickPrevious={() => {}}
                onClickNext={() => {}}
                onClose={() => {}}
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

        expect(screen.getByText('NEW ARTICLE')).toBeInTheDocument()
    })

    describe('Playground Panel', () => {
        const baseArticleProps = {
            helpCenter: getHelpCentersResponseFixture.data[0],
            locales: getLocalesResponseFixture,
            categories: [],
            onClickPrevious: () => {},
            onClickNext: () => {},
            onClose: () => {},
        }

        it('should not show playground panel initially for existing article', () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            expect(
                screen.queryByTestId('playground-panel'),
            ).not.toBeInTheDocument()
        })

        it('should not show playground panel initially for new article', () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
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
                screen.queryByTestId('playground-panel'),
            ).not.toBeInTheDocument()
        })

        it('should open playground panel when Test button is clicked on existing article', async () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            expect(
                screen.queryByTestId('playground-panel'),
            ).not.toBeInTheDocument()

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()
        })

        it('should open playground panel when Test button is clicked on new article', async () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
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
                screen.queryByTestId('playground-panel'),
            ).not.toBeInTheDocument()

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()
        })

        it('should show two columns when playground is open', async () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByText('EXISTING ARTICLE')).toBeInTheDocument()
            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()
        })

        it('should close playground panel when close button is clicked', async () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()

            await act(() =>
                userEvent.click(
                    screen.getByRole('button', { name: /close playground/i }),
                ),
            )

            expect(
                screen.queryByTestId('playground-panel'),
            ).not.toBeInTheDocument()
        })

        it('should toggle playground when Test button is clicked multiple times', async () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(
                screen.queryByTestId('playground-panel'),
            ).not.toBeInTheDocument()

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()
        })

        it('should render playground only when open', async () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            expect(
                screen.queryByTestId('playground-panel'),
            ).not.toBeInTheDocument()

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()
        })

        it('should maintain playground state when toggling fullscreen', async () => {
            render(
                <KnowledgeEditorHelpCenterArticle
                    {...baseArticleProps}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            await act(() =>
                userEvent.click(screen.getByRole('button', { name: /test/i })),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()

            fireEvent.click(screen.getByRole('button', { name: 'fullscreen' }))

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()

            fireEvent.click(
                screen.getByRole('button', { name: 'leave fullscreen' }),
            )

            expect(screen.getByTestId('playground-panel')).toBeInTheDocument()
        })
    })

    describe('SidePanel onOpenChange', () => {
        it('calls onClose when SidePanel onOpenChange is triggered with false', async () => {
            const user = userEvent.setup()
            const onClose = jest.fn()

            render(
                <KnowledgeEditorHelpCenterArticle
                    helpCenter={getHelpCentersResponseFixture.data[0]}
                    locales={getLocalesResponseFixture}
                    categories={[]}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            const closeButton = screen.getByTestId('close-panel-button')
            await act(() => user.click(closeButton))

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('does not call onClose when SidePanel onOpenChange is triggered with true', () => {
            const onClose = jest.fn()

            render(
                <KnowledgeEditorHelpCenterArticle
                    helpCenter={getHelpCentersResponseFixture.data[0]}
                    locales={getLocalesResponseFixture}
                    categories={[]}
                    onClickPrevious={() => {}}
                    onClickNext={() => {}}
                    onClose={onClose}
                    article={{
                        type: 'existing',
                        initialArticleMode: 'read' as InitialArticleMode,
                        articleId: 1,
                    }}
                />,
            )

            expect(onClose).not.toHaveBeenCalled()
        })
    })
})
