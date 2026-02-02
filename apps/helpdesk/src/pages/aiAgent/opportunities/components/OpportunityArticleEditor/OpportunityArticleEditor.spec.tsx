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
})
