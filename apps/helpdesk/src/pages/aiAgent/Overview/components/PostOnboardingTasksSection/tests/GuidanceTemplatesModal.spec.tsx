import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { GuidanceTemplate } from 'pages/aiAgent/types'

import { GuidanceTemplatesModal } from '../GuidanceTemplatesModal'

jest.mock('pages/aiAgent/hooks/useGuidanceTemplates', () => ({
    useGuidanceTemplates: () => ({
        guidanceTemplates: mockGuidanceTemplates,
    }),
}))

jest.mock(
    'pages/aiAgent/components/GuidanceTemplateCard/GuidanceTemplateCard',
    () => ({
        GuidanceTemplateCard: ({ onClick, guidanceTemplate }: any) => (
            <div data-testid="guidance-template-card" onClick={onClick}>
                {guidanceTemplate.name}
            </div>
        ),
    }),
)

const mockGuidanceTemplates: GuidanceTemplate[] = [
    {
        id: '1',
        name: 'Template 1',
        content: 'Content 1',
        tag: 'Tag 1',
        style: { color: 'red', background: 'blue' },
    },
    {
        id: '2',
        name: 'Template 2',
        content: 'Content 2',
        tag: 'Tag 2',
        style: { color: 'red', background: 'blue' },
    },
]

describe('GuidanceTemplatesModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onTemplateClick: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal with correct title and subtitle when isOpen is true', () => {
        render(<GuidanceTemplatesModal {...defaultProps} />)

        expect(screen.getByText('Guidance templates')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Edit, test, and refine these scenarios to build knowledge quickly.',
            ),
        ).toBeInTheDocument()
    })

    it('does not render the modal when isOpen is false', () => {
        render(<GuidanceTemplatesModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Guidance templates')).not.toBeInTheDocument()
    })

    it('renders all guidance templates', () => {
        render(<GuidanceTemplatesModal {...defaultProps} />)

        expect(screen.getByText('Template 1')).toBeInTheDocument()
        expect(screen.getByText('Template 2')).toBeInTheDocument()
    })

    it('renders the custom card option', () => {
        render(<GuidanceTemplatesModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /Custom Guidance/ }),
        ).toBeInTheDocument()
    })

    it('calls onTemplateClick when a template card is clicked', async () => {
        const user = userEvent.setup()
        const onTemplateClick = jest.fn()

        render(
            <GuidanceTemplatesModal
                {...defaultProps}
                onTemplateClick={onTemplateClick}
            />,
        )

        const templateCards = screen.getAllByTestId('guidance-template-card')
        await act(async () => {
            await user.click(templateCards[0])
        })

        expect(onTemplateClick).toHaveBeenCalledWith(mockGuidanceTemplates[0])
    })

    it('calls onClose when the modal is closed', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()

        render(<GuidanceTemplatesModal {...defaultProps} onClose={onClose} />)

        const closeButton = screen.getByText('close')
        await act(async () => {
            await user.click(closeButton)
        })

        expect(onClose).toHaveBeenCalled()
    })
})
