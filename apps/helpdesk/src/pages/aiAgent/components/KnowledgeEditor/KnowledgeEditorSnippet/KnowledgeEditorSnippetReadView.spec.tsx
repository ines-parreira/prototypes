import { render, screen } from '@testing-library/react'

import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import { KnowledgeEditorSnippetReadView } from './KnowledgeEditorSnippetReadView'

describe('KnowledgeEditorSnippetReadView', () => {
    const baseProps = {
        title: 'Test Snippet Title',
        content: '<p>Test snippet content</p>',
    }

    describe('URL Snippet', () => {
        it('renders URL snippet with link icon', () => {
            render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel="https://example.com"
                    sourceUrl="https://example.com"
                    snippetType={SnippetType.URL}
                />,
            )

            expect(screen.getByText('Test Snippet Title')).toBeInTheDocument()
            expect(screen.getByText('https://example.com')).toBeInTheDocument()

            const link = screen.getByRole('link')
            expect(link).toHaveAttribute('href', 'https://example.com')
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })

        it('renders link icon for URL snippet', () => {
            const { container } = render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel="https://example.com"
                    sourceUrl="https://example.com"
                    snippetType={SnippetType.URL}
                />,
            )

            const icon = container.querySelector(
                '[aria-label="link-horizontal"]',
            )
            expect(icon).toBeInTheDocument()
        })
    })

    describe('Document Snippet', () => {
        it('renders document snippet with attachment icon and filename', () => {
            render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel="document.pdf"
                    sourceUrl="https://storage.googleapis.com/bucket/document.pdf"
                    snippetType={SnippetType.Document}
                />,
            )

            expect(screen.getByText('Test Snippet Title')).toBeInTheDocument()
            expect(screen.getByText('document.pdf')).toBeInTheDocument()

            const link = screen.getByRole('link')
            expect(link).toHaveAttribute(
                'href',
                'https://storage.googleapis.com/bucket/document.pdf',
            )
        })

        it('renders attachment icon for document snippet', () => {
            const { container } = render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel="document.pdf"
                    sourceUrl="https://storage.googleapis.com/bucket/document.pdf"
                    snippetType={SnippetType.Document}
                />,
            )

            const icon = container.querySelector(
                '[aria-label="paperclip-attachment"]',
            )
            expect(icon).toBeInTheDocument()
        })
    })

    describe('Store Snippet', () => {
        it('renders store snippet with globe icon', () => {
            render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel="https://store.example.com"
                    sourceUrl="https://store.example.com"
                    snippetType={SnippetType.Store}
                />,
            )

            expect(screen.getByText('Test Snippet Title')).toBeInTheDocument()
            expect(
                screen.getByText('https://store.example.com'),
            ).toBeInTheDocument()

            const link = screen.getByRole('link')
            expect(link).toHaveAttribute('href', 'https://store.example.com')
        })

        it('renders globe icon for store snippet', () => {
            const { container } = render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel="https://store.example.com"
                    sourceUrl="https://store.example.com"
                    snippetType={SnippetType.Store}
                />,
            )

            const icon = container.querySelector('[aria-label="nav-globe"]')
            expect(icon).toBeInTheDocument()
        })
    })

    describe('Content rendering', () => {
        it('renders content in wrapper', () => {
            const { container } = render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel="https://example.com"
                    sourceUrl="https://example.com"
                    snippetType={SnippetType.URL}
                />,
            )

            const contentWrapper = container.querySelector(
                '[class*="contentWrapper"]',
            )
            expect(contentWrapper).toBeInTheDocument()
            expect(contentWrapper).toHaveTextContent('Test snippet content')
        })
    })

    describe('Source handling', () => {
        it('does not render source link when sourceLabel is empty', () => {
            render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel=""
                    sourceUrl="https://example.com"
                    snippetType={SnippetType.URL}
                />,
            )

            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })

        it('renders source link when sourceLabel is provided', () => {
            render(
                <KnowledgeEditorSnippetReadView
                    {...baseProps}
                    sourceLabel="https://example.com"
                    sourceUrl="https://example.com"
                    snippetType={SnippetType.URL}
                />,
            )

            expect(screen.getByRole('link')).toBeInTheDocument()
        })
    })
})
