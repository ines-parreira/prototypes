import { render, screen } from '@testing-library/react'

import { KnowledgeEditorHelpCenterArticleReadView } from './KnowledgeEditorHelpCenterArticleReadView'

describe('KnowledgeEditorHelpCenterArticleReadView', () => {
    describe('title rendering', () => {
        it('should render the title as a heading', () => {
            render(
                <KnowledgeEditorHelpCenterArticleReadView
                    title="Getting Started Guide"
                    content="<p>Welcome</p>"
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Getting Started Guide' }),
            ).toBeInTheDocument()
        })

        it('should render title with special characters', () => {
            render(
                <KnowledgeEditorHelpCenterArticleReadView
                    title="How to use [Feature] & {Settings}?"
                    content="<p>Content</p>"
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'How to use [Feature] & {Settings}?',
                }),
            ).toBeInTheDocument()
        })
    })

    describe('content rendering', () => {
        it('should render complex HTML with multiple elements including lists, paragraphs, headings, formatting, and tables', () => {
            const html = `
                <h2>Introduction</h2>
                <p>This article covers the <strong>essential features</strong> and <em>important concepts</em>.</p>

                <h3>Unordered List</h3>
                <ul>
                    <li>First item</li>
                    <li>Second item with <strong>bold text</strong></li>
                    <li>Third item</li>
                </ul>

                <h3>Ordered List</h3>
                <ol>
                    <li>Step one: Setup</li>
                    <li>Step two: Configuration</li>
                    <li>Step three: Testing</li>
                </ol>

                <h3>Code Example</h3>
                <pre><code>const example = "Hello World";</code></pre>



                <blockquote>Remember to always test your changes before deploying.</blockquote>

                <p>For more information, visit <a href="https://docs.example.com">our documentation</a>.</p>
            `

            render(
                <KnowledgeEditorHelpCenterArticleReadView
                    title="Complete Guide"
                    content={html}
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Introduction' }),
            ).toBeInTheDocument()
            expect(screen.getByText(/essential features/)).toBeInTheDocument()
            expect(screen.getByText(/important concepts/)).toBeInTheDocument()

            expect(
                screen.getByRole('heading', { name: 'Unordered List' }),
            ).toBeInTheDocument()
            expect(screen.getByText('First item')).toBeInTheDocument()
            expect(screen.getByText(/Second item with/)).toBeInTheDocument()
            expect(screen.getByText('bold text')).toBeInTheDocument()
            expect(screen.getByText('Third item')).toBeInTheDocument()

            expect(
                screen.getByRole('heading', { name: 'Ordered List' }),
            ).toBeInTheDocument()
            expect(screen.getByText('Step one: Setup')).toBeInTheDocument()
            expect(
                screen.getByText('Step two: Configuration'),
            ).toBeInTheDocument()
            expect(screen.getByText('Step three: Testing')).toBeInTheDocument()

            expect(
                screen.getByRole('heading', { name: 'Code Example' }),
            ).toBeInTheDocument()
            expect(
                screen.getByText('const example = "Hello World";'),
            ).toBeInTheDocument()

            expect(
                screen.getByText(
                    'Remember to always test your changes before deploying.',
                ),
            ).toBeInTheDocument()

            const link = screen.getByRole('link', { name: 'our documentation' })
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', 'https://docs.example.com')
        })

        it('should render empty content', () => {
            const { container } = render(
                <KnowledgeEditorHelpCenterArticleReadView
                    title="Test Article"
                    content=""
                />,
            )

            const contentWrapper = container.querySelector('.contentWrapper')
            expect(contentWrapper).toBeInTheDocument()
        })
    })
})
