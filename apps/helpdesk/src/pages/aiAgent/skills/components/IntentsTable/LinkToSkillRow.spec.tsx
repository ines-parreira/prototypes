import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeProvider } from 'core/theme'

import type { TransformedArticle } from '../../types'
import { LinkToSkillRow } from './LinkToSkillRow'

Element.prototype.getAnimations = jest.fn(() => [])

const makeArticle = (
    overrides: Partial<TransformedArticle> = {},
): TransformedArticle => ({
    id: 1,
    title: 'Order cancellations',
    content: '',
    intents: [
        { name: 'order::cancel', formattedName: 'Order / Cancel' },
        { name: 'order::refund', formattedName: 'Order / Refund' },
    ],
    status: 'enabled',
    metrics: {
        tickets: 672,
        prevTickets: null,
        handoverTickets: 50,
        prevHandoverTickets: null,
        csat: 4.0,
        prevCsat: null,
        resourceSourceSetId: 1,
    },
    ...overrides,
})

const renderRow = (
    props: Partial<Parameters<typeof LinkToSkillRow>[0]> = {},
) => {
    const defaults = {
        article: makeArticle(),
        isSelected: false,
        onToggle: jest.fn(),
    }
    return render(
        <ThemeProvider>
            <LinkToSkillRow {...defaults} {...props} />
        </ThemeProvider>,
    )
}

describe('LinkToSkillRow', () => {
    it('should call onToggle with article id when clicked', async () => {
        const user = userEvent.setup()
        const onToggle = jest.fn()
        renderRow({ onToggle })

        await user.click(screen.getByRole('option'))

        expect(onToggle).toHaveBeenCalledWith(1)
    })

    it('should call onToggle when Enter key is pressed', async () => {
        const user = userEvent.setup()
        const onToggle = jest.fn()
        renderRow({ onToggle })

        const option = screen.getByRole('option')
        option.focus()
        await user.keyboard('{Enter}')

        expect(onToggle).toHaveBeenCalledWith(1)
    })

    it('should show check icon when selected', () => {
        renderRow({ isSelected: true })

        expect(screen.getByRole('option')).toHaveAttribute(
            'aria-selected',
            'true',
        )
    })
})
