import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { KnowledgeEditorSnippetView } from './KnowledgeEditorSnippetView'

const store = mockStore({
    ui: {
        stats: {
            drillDown: {
                isOpen: false,
                currentPage: 1,
                metricData: null,
                export: {
                    isLoading: false,
                    isError: false,
                    isRequested: false,
                },
            },
        },
    },
})

const MockQueryClientProvider = mockQueryClientProvider().QueryClientProvider

const renderWithProvider = (ui: React.ReactElement) => {
    return render(
        <Provider store={store}>
            <MockQueryClientProvider>{ui}</MockQueryClientProvider>
        </Provider>,
    )
}

describe('KnowledgeEditorSnippetView', () => {
    const baseProps = {
        onClose: jest.fn(),
        onClickPrevious: jest.fn(),
        onClickNext: jest.fn(),
        onToggleFullscreen: jest.fn(),
        onToggleAIAgentEnabled: jest.fn(),
        onTest: jest.fn(),
        isFullscreen: false,
        shouldHideFullscreenButton: false,
    }

    const urlSnippet = {
        id: 1,
        title: 'Test URL Snippet',
        content: '<p>URL snippet content</p>',
        aiAgentEnabled: 'PUBLIC',
        createdDatetime: new Date('2025-01-01'),
        lastUpdatedDatetime: new Date('2025-01-02'),
        type: SnippetType.URL as const,
        source: 'https://example.com',
    }

    const documentSnippet = {
        id: 2,
        title: 'Test Document Snippet',
        content: '<p>Document snippet content</p>',
        aiAgentEnabled: 'PUBLIC',
        createdDatetime: new Date('2025-01-01'),
        lastUpdatedDatetime: new Date('2025-01-02'),
        type: SnippetType.Document as const,
        source: 'document.pdf',
        googleStorageUrl: 'https://storage.googleapis.com/bucket/document.pdf',
    }

    const storeSnippet = {
        id: 3,
        title: 'Test Store Snippet',
        content: '<p>Store snippet content</p>',
        aiAgentEnabled: 'PUBLIC',
        createdDatetime: new Date('2025-01-01'),
        lastUpdatedDatetime: new Date('2025-01-02'),
        type: SnippetType.Store as const,
        sources: [
            'https://store.example.com/product1',
            'https://store.example.com/product2',
        ],
        domain: 'https://store.example.com',
    }

    it('renders URL snippet with correct title and source', () => {
        const { container } = renderWithProvider(
            <KnowledgeEditorSnippetView {...baseProps} snippet={urlSnippet} />,
        )

        expect(screen.getByText('Test URL Snippet')).toBeInTheDocument()
        expect(
            screen.getAllByText('https://example.com').length,
        ).toBeGreaterThan(0)
        expect(
            container.querySelector('.contentWrapper')?.textContent,
        ).toContain('URL snippet content')
    })

    it('renders document snippet with correct title and source', () => {
        const { container } = renderWithProvider(
            <KnowledgeEditorSnippetView
                {...baseProps}
                snippet={documentSnippet}
            />,
        )

        expect(screen.getByText('Test Document Snippet')).toBeInTheDocument()
        expect(screen.getAllByText('document.pdf').length).toBeGreaterThan(0)
        expect(
            container.querySelector('.contentWrapper')?.textContent,
        ).toContain('Document snippet content')
    })

    it('renders store snippet with correct title and sources', () => {
        const { container } = renderWithProvider(
            <KnowledgeEditorSnippetView
                {...baseProps}
                snippet={storeSnippet}
            />,
        )

        expect(screen.getByText('Test Store Snippet')).toBeInTheDocument()
        expect(
            screen.getByText('https://store.example.com'),
        ).toBeInTheDocument()
        expect(
            container.querySelector('.contentWrapper')?.textContent,
        ).toContain('Store snippet content')
    })

    it('passes AI Agent status to side panel when details view is toggled', async () => {
        renderWithProvider(
            <KnowledgeEditorSnippetView {...baseProps} snippet={urlSnippet} />,
        )

        // Side panel is visible by default with collapse button
        const collapseButton = screen.getByRole('button', {
            name: /collapse side panel/i,
        })
        expect(collapseButton).toBeInTheDocument()

        expect(screen.getByText('Test URL Snippet')).toBeInTheDocument()
    })

    it('shows side panel by default', () => {
        renderWithProvider(
            <KnowledgeEditorSnippetView {...baseProps} snippet={urlSnippet} />,
        )

        const detailsButton = screen.getByRole('button', {
            name: /collapse side panel/i,
        })
        expect(detailsButton).toBeInTheDocument()
    })

    it('calls onToggleFullscreen when fullscreen button is clicked', async () => {
        const user = userEvent.setup()
        const onToggleFullscreen = jest.fn()

        renderWithProvider(
            <KnowledgeEditorSnippetView
                {...baseProps}
                snippet={urlSnippet}
                onToggleFullscreen={onToggleFullscreen}
            />,
        )

        const fullscreenButton = screen.getByRole('button', {
            name: /fullscreen/i,
        })
        await act(() => user.click(fullscreenButton))

        expect(onToggleFullscreen).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when close button is clicked', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()

        renderWithProvider(
            <KnowledgeEditorSnippetView
                {...baseProps}
                snippet={urlSnippet}
                onClose={onClose}
            />,
        )

        const closeButton = screen.getByRole('button', { name: /close/i })
        await act(() => user.click(closeButton))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('renders read view with snippet content', () => {
        renderWithProvider(
            <KnowledgeEditorSnippetView {...baseProps} snippet={urlSnippet} />,
        )

        expect(screen.getByText('Test URL Snippet')).toBeInTheDocument()
    })

    it('renders document snippet with google storage URL', () => {
        renderWithProvider(
            <KnowledgeEditorSnippetView
                {...baseProps}
                snippet={documentSnippet}
            />,
        )

        expect(screen.getByText('Test Document Snippet')).toBeInTheDocument()
    })

    it('renders store snippet with multiple sources', () => {
        renderWithProvider(
            <KnowledgeEditorSnippetView
                {...baseProps}
                snippet={storeSnippet}
            />,
        )

        expect(screen.getByText('Test Store Snippet')).toBeInTheDocument()
    })

    describe('TestButton visibility based on isPlaygroundOpen', () => {
        it('should show Test button when isPlaygroundOpen is false', () => {
            renderWithProvider(
                <KnowledgeEditorSnippetView
                    {...baseProps}
                    snippet={urlSnippet}
                    isPlaygroundOpen={false}
                />,
            )

            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should hide Test button when isPlaygroundOpen is true', () => {
            renderWithProvider(
                <KnowledgeEditorSnippetView
                    {...baseProps}
                    snippet={urlSnippet}
                    isPlaygroundOpen={true}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })

        it('should show Test button by default when isPlaygroundOpen is not provided', () => {
            renderWithProvider(
                <KnowledgeEditorSnippetView
                    {...baseProps}
                    snippet={urlSnippet}
                />,
            )

            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })
    })
})
