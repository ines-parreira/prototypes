import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
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

const mockOpportunity: Opportunity = {
    id: '123',
    key: 'ai_123',
    type: OpportunityType.FILL_KNOWLEDGE_GAP,
    title: 'Test Guidance Title',
    content: 'Test guidance content',
    ticketCount: 5,
}

describe('OpportunityGuidanceEditor', () => {
    const defaultProps = {
        opportunity: mockOpportunity,
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
            body: 'Test guidance content',
            isVisible: true,
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
            body: 'New content',
            isVisible: true,
        })
    })

    it('should render only form fields in editor mode', () => {
        render(
            <OpportunityGuidanceEditor
                {...defaultProps}
                isInGuidanceEditorModeOnly
            />,
        )

        expect(screen.getByLabelText(/guidance name/i)).toBeInTheDocument()
        expect(screen.getByTestId('guidance-editor')).toBeInTheDocument()
        expect(screen.queryByText(/preview/i)).not.toBeInTheDocument()
    })

    it('should disable inputs when isVisible is false', () => {
        render(
            <OpportunityGuidanceEditor {...defaultProps} isVisible={false} />,
        )

        const nameInput = screen.getByLabelText(/guidance name/i)
        expect(nameInput).toBeDisabled()
    })
})
