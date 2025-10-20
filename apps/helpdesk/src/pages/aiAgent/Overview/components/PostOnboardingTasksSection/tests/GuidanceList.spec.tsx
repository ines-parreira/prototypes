import React from 'react'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { LocaleCode } from 'models/helpCenter/types'
import { GuidanceArticle } from 'pages/aiAgent/types'

import { GuidanceList } from '../GuidanceList'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            guidance: '/test-shop/ai-agent/guidance',
        },
    }),
}))

const defaultProps = {
    guidanceArticles: [
        {
            id: 1,
            title: 'Guidance Article 1',
            content: 'Content 1',
            visibility: 'PUBLIC',
            locale: 'en-US',
            lastUpdated: '2023-01-01T00:00:00Z',
            templateKey: '',
        } as GuidanceArticle,
    ],
    isLoading: false,
    shopName: 'test-shop',
    onDelete: jest.fn(),
    onEdit: jest.fn(),
}

describe('GuidanceList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders nothing when guidanceArticles is empty', () => {
        const { container } = render(
            <GuidanceList {...defaultProps} guidanceArticles={[]} />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('renders guidance articles correctly', () => {
        render(<GuidanceList {...defaultProps} />)

        expect(screen.getByText('Guidance Article 1')).toBeInTheDocument()
    })

    it('calls onEdit when edit button is clicked', async () => {
        const user = userEvent.setup()
        const onEdit = jest.fn()

        render(<GuidanceList {...defaultProps} onEdit={onEdit} />)

        const editButtons = screen.getAllByRole('img', { name: 'edit-pencil' })
        const editButton = editButtons[0].closest('.actionButton')
        if (editButton) {
            await act(async () => {
                await user.click(editButton)
            })
        }

        expect(onEdit).toHaveBeenCalledWith(1)
    })

    it('calls onDelete when delete button is clicked', async () => {
        const user = userEvent.setup()
        const onDelete = jest.fn()

        render(<GuidanceList {...defaultProps} onDelete={onDelete} />)

        const deleteButtons = screen.getAllByRole('img', {
            name: 'trash-empty',
        })
        const deleteButton = deleteButtons[0].closest('.actionButton')
        if (deleteButton) {
            await act(async () => {
                await user.click(deleteButton)
            })
        }

        expect(onDelete).toHaveBeenCalledWith(1)
    })

    it('does not show "View all guidances" link when there are 5 or fewer articles', () => {
        render(<GuidanceList {...defaultProps} />)

        expect(screen.queryByText('View all guidances')).not.toBeInTheDocument()
    })

    it('limits the displayed articles to 5 when there are more', () => {
        const manyArticles = Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            title: `Guidance Article ${i + 1}`,
            content: `Content ${i + 1}`,
            visibility: 'PUBLIC' as const,
            locale: 'en-US' as LocaleCode,
            createdDatetime: `2023-01-0${i + 1}T00:00:00Z`,
            lastUpdated: `2023-01-0${i + 1}T00:00:00Z`,
            templateKey: '',
        }))

        render(
            <GuidanceList {...defaultProps} guidanceArticles={manyArticles} />,
        )

        expect(screen.getByText('View all guidances')).toBeInTheDocument()

        // First 5 should be visible
        expect(screen.getByText('Guidance Article 1')).toBeInTheDocument()
        expect(screen.getByText('Guidance Article 5')).toBeInTheDocument()

        // 6th and beyond should not be visible
        expect(screen.queryByText('Guidance Article 6')).not.toBeInTheDocument()
        expect(screen.queryByText('Guidance Article 8')).not.toBeInTheDocument()
    })

    it('renders loading skeleton when isLoading is true', () => {
        const { container } = render(
            <GuidanceList {...defaultProps} isLoading={true} />,
        )

        const skeletons = container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )
        expect(skeletons.length).toBeGreaterThan(0)
    })
})
