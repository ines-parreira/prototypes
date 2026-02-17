import { render, screen } from '@testing-library/react'
import HtmlDiff from 'htmldiff-js'

import { KnowledgeEditorHelpCenterArticleDiffView } from './KnowledgeEditorHelpCenterArticleDiffView'

jest.mock('htmldiff-js', () => ({
    __esModule: true,
    default: {
        execute: jest.fn(
            (oldHtml: string, newHtml: string) =>
                `<div>diff of ${oldHtml} and ${newHtml}</div>`,
        ),
    },
}))

describe('KnowledgeEditorHelpCenterArticleDiffView', () => {
    beforeEach(() => {
        jest.mocked(HtmlDiff.execute).mockClear()
    })

    it('renders unchanged title when titles are identical', () => {
        render(
            <KnowledgeEditorHelpCenterArticleDiffView
                oldTitle="Same Title"
                newTitle="Same Title"
                oldContent="<p>old</p>"
                newContent="<p>old</p>"
            />,
        )

        expect(screen.getByText('Same Title')).toBeInTheDocument()
    })

    it('renders added title text separately from unchanged text', () => {
        render(
            <KnowledgeEditorHelpCenterArticleDiffView
                oldTitle="Hello"
                newTitle="Hello World"
                oldContent="<p>content</p>"
                newContent="<p>content</p>"
            />,
        )

        expect(screen.getByText('Hello')).toBeInTheDocument()
        expect(screen.getByText(/World/)).toBeInTheDocument()
    })

    it('renders removed title text separately from unchanged text', () => {
        const { container } = render(
            <KnowledgeEditorHelpCenterArticleDiffView
                oldTitle="Hello World"
                newTitle="Hello"
                oldContent="<p>content</p>"
                newContent="<p>content</p>"
            />,
        )

        const heading = container.querySelector('h2')
        expect(heading).not.toBeNull()
        expect(heading?.textContent).toContain('Hello')
        expect(heading?.textContent).toContain('World')
    })

    it('renders HTML diff content', () => {
        const { container } = render(
            <KnowledgeEditorHelpCenterArticleDiffView
                oldTitle="Title"
                newTitle="Title"
                oldContent="<p>old content</p>"
                newContent="<p>new content</p>"
            />,
        )

        const contentWrapper = container.querySelector(
            '[class*="contentWrapper"]',
        )
        expect(contentWrapper).not.toBeNull()
        expect(contentWrapper?.textContent).toContain('diff of')
    })

    it('handles empty old title', () => {
        render(
            <KnowledgeEditorHelpCenterArticleDiffView
                oldTitle=""
                newTitle="New Title"
                oldContent=""
                newContent="<p>new</p>"
            />,
        )

        expect(screen.getByText('New Title')).toBeInTheDocument()
    })

    it('handles empty new title', () => {
        render(
            <KnowledgeEditorHelpCenterArticleDiffView
                oldTitle="Old Title"
                newTitle=""
                oldContent="<p>old</p>"
                newContent=""
            />,
        )

        expect(screen.getByText('Old Title')).toBeInTheDocument()
    })

    it('renders both added and removed parts for replaced title words', () => {
        const { container } = render(
            <KnowledgeEditorHelpCenterArticleDiffView
                oldTitle="Hello World"
                newTitle="Hello Planet"
                oldContent="<p>content</p>"
                newContent="<p>content</p>"
            />,
        )

        const heading = container.querySelector('h2')
        expect(heading).not.toBeNull()
        expect(heading?.textContent).toContain('Hello')
        expect(heading?.textContent).toContain('World')
        expect(heading?.textContent).toContain('Planet')

        const spans = heading?.querySelectorAll('span') ?? []
        expect(spans.length).toBeGreaterThanOrEqual(3)
    })

    it('renders removed images when diff HTML wraps images in del tags', () => {
        const executeMock = jest.mocked(HtmlDiff.execute)
        executeMock.mockReturnValueOnce(
            '<p><del><img src="https://example.com/removed.png" alt="Removed guide image" /></del></p>',
        )

        const { container } = render(
            <KnowledgeEditorHelpCenterArticleDiffView
                oldTitle="Title"
                newTitle="Title"
                oldContent="<p>old with image</p>"
                newContent="<p>new without image</p>"
            />,
        )

        const removedImage = container.querySelector(
            'del img[src="https://example.com/removed.png"]',
        )
        expect(removedImage).toBeInTheDocument()
    })
})
