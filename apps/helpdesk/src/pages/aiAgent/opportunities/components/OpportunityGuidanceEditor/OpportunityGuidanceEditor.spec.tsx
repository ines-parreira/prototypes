import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { OpportunityResource } from '../../types'
import { ResourceType } from '../../types'
import { OpportunityGuidanceEditor } from './OpportunityGuidanceEditor'

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
        })),
    }),
)

jest.mock('pages/aiAgent/components/GuidanceEditor/GuidanceEditor', () => ({
    GuidanceEditor: ({ content, handleUpdateContent }: any) => (
        <textarea
            data-testid="guidance-editor"
            value={content}
            onChange={(e) => handleUpdateContent(e.target.value)}
        />
    ),
}))

const mockResource: OpportunityResource = {
    title: 'Test Guidance Title',
    content: 'Test guidance content',
    type: ResourceType.GUIDANCE,
    isVisible: true,
}

describe('OpportunityGuidanceEditor', () => {
    const defaultProps = {
        resource: mockResource,
        shopName: 'test-shop',
    }

    it('should render guidance name field with opportunity title', () => {
        render(<OpportunityGuidanceEditor {...defaultProps} />)

        const nameInput = screen.getByLabelText(/guidance name/i)
        expect(nameInput).toHaveValue('Test Guidance Title')
    })

    it('should render guidance editor with opportunity content', () => {
        render(<OpportunityGuidanceEditor {...defaultProps} />)

        const editor = screen.getByTestId('guidance-editor')
        expect(editor).toHaveValue('Test guidance content')
    })

    it('should call onValuesChange when title changes', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()

        render(
            <OpportunityGuidanceEditor
                {...defaultProps}
                onValuesChange={onValuesChange}
            />,
        )

        const nameInput = screen.getByLabelText(/guidance name/i)
        await user.clear(nameInput)
        await user.type(nameInput, 'New Title')

        expect(onValuesChange).toHaveBeenLastCalledWith({
            title: 'New Title',
            content: 'Test guidance content',
            isVisible: true,
            isDeleted: false,
        })
    })

    it('should call onValuesChange when body changes', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()

        render(
            <OpportunityGuidanceEditor
                {...defaultProps}
                onValuesChange={onValuesChange}
            />,
        )

        const editor = screen.getByTestId('guidance-editor')
        await user.clear(editor)
        await user.type(editor, 'New content')

        expect(onValuesChange).toHaveBeenLastCalledWith({
            title: 'Test Guidance Title',
            content: 'New content',
            isVisible: true,
            isDeleted: false,
        })
    })

    it('should render knowledge gap view', () => {
        const resourceWithInsight = {
            ...mockResource,
            insight: 'This is an AI-generated summary',
        }

        render(
            <OpportunityGuidanceEditor
                {...defaultProps}
                resource={resourceWithInsight}
                isInReadOnlyMode
            />,
        )

        expect(screen.getByText('Summary')).toBeInTheDocument()
        expect(
            screen.getByText('This is an AI-generated summary'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /go to guidance/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByLabelText(/guidance name/i),
        ).not.toBeInTheDocument()
    })

    it('should disable inputs when isVisible is false', () => {
        render(
            <OpportunityGuidanceEditor
                {...defaultProps}
                resource={{ ...mockResource, isVisible: false }}
            />,
        )

        const nameInput = screen.getByLabelText(/guidance name/i)
        expect(nameInput).toBeDisabled()
    })
})
