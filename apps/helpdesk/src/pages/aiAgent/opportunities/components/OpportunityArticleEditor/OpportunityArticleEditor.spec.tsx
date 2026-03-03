import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { OpportunityResource } from '../../types'
import { ResourceType } from '../../types'
import { OpportunityArticleEditor } from './OpportunityArticleEditor'

jest.mock('pages/aiAgent/components/GuidanceEditor/GuidanceEditor', () => ({
    GuidanceEditor: ({ content, handleUpdateContent, label }: any) => (
        <div>
            {label && <label htmlFor="guidance-editor">{label}</label>}
            <textarea
                id="guidance-editor"
                data-testid="guidance-editor"
                value={content}
                onChange={(e) => handleUpdateContent(e.target.value)}
            />
        </div>
    ),
}))

const mockResource: OpportunityResource = {
    title: 'Test Article Title',
    content: 'Test article body content',
    type: ResourceType.ARTICLE,
    isVisible: true,
}

describe('OpportunityArticleEditor', () => {
    const defaultProps = {
        resource: mockResource,
        shopName: 'test-shop',
    }

    it('should render article editor heading', () => {
        render(<OpportunityArticleEditor {...defaultProps} />)

        expect(screen.getByText('Help Center article')).toBeInTheDocument()
    })

    it('should render body field with content', () => {
        render(<OpportunityArticleEditor {...defaultProps} />)

        const bodyEditor = screen.getByLabelText('Body')
        expect(bodyEditor).toHaveValue('Test article body content')
    })

    it('should render body editor when isVisible is false', () => {
        render(
            <OpportunityArticleEditor
                {...defaultProps}
                resource={{ ...mockResource, isVisible: false }}
            />,
        )

        const bodyEditor = screen.getByLabelText('Body')
        expect(bodyEditor).toHaveValue('Test article body content')
    })

    it('should call onValuesChange when title is changed', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()
        render(
            <OpportunityArticleEditor
                {...defaultProps}
                onValuesChange={onValuesChange}
            />,
        )

        const titleInput = screen.getByRole('textbox', { name: /title/i })
        await user.type(titleInput, ' Updated')

        expect(onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Test Article Title Updated',
                content: 'Test article body content',
                isVisible: true,
                isDeleted: false,
            }),
        )
    })

    it('should call onValuesChange when content is changed', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()
        render(
            <OpportunityArticleEditor
                {...defaultProps}
                onValuesChange={onValuesChange}
            />,
        )

        const bodyEditor = screen.getByLabelText('Body')
        await user.type(bodyEditor, ' Updated')

        expect(onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Test Article Title',
                content: 'Test article body content Updated',
                isVisible: true,
                isDeleted: false,
            }),
        )
    })

    it('should render Disable button when article is visible', () => {
        render(<OpportunityArticleEditor {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /disable/i }),
        ).toBeInTheDocument()
    })

    it('should render Enable button when article is not visible', () => {
        render(
            <OpportunityArticleEditor
                {...defaultProps}
                resource={{ ...mockResource, isVisible: false }}
            />,
        )

        expect(
            screen.getByRole('button', { name: /enable/i }),
        ).toBeInTheDocument()
    })

    it('should call onValuesChange with isVisible false when Disable is clicked', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()
        render(
            <OpportunityArticleEditor
                {...defaultProps}
                onValuesChange={onValuesChange}
            />,
        )

        await user.click(screen.getByRole('button', { name: /disable/i }))

        expect(onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({ isVisible: false }),
        )
    })

    it('should call onValuesChange with isVisible true when Enable is clicked', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()
        render(
            <OpportunityArticleEditor
                {...defaultProps}
                resource={{ ...mockResource, isVisible: false }}
                onValuesChange={onValuesChange}
            />,
        )

        await user.click(screen.getByRole('button', { name: /enable/i }))

        expect(onValuesChange).toHaveBeenCalledWith(
            expect.objectContaining({ isVisible: true }),
        )
    })

    it('should disable title input after clicking Disable', async () => {
        const user = userEvent.setup()
        render(<OpportunityArticleEditor {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: /disable/i }))

        const titleInput = screen.getByRole('textbox', { name: /title/i })
        expect(titleInput).toBeDisabled()
    })
})
