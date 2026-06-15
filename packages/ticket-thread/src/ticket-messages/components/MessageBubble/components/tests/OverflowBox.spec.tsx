import { screen } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { OverflowBox } from '../OverflowBox'

describe('OverflowBox', () => {
    beforeEach(() => {
        vi.restoreAllMocks()

        vi.spyOn(
            HTMLElement.prototype,
            'scrollHeight',
            'get',
        ).mockImplementation(function (this: HTMLElement) {
            const element = this

            return element.firstElementChild instanceof HTMLElement &&
                element.firstElementChild.dataset.testid === 'overflow-content'
                ? 120
                : 0
        })

        vi.spyOn(
            HTMLElement.prototype,
            'offsetHeight',
            'get',
        ).mockImplementation(function (this: HTMLElement) {
            return this.querySelector('button') instanceof HTMLButtonElement
                ? 24
                : 0
        })
    })

    it('does not render a toggle when content fits', () => {
        render(
            <OverflowBox nonExpandedMaxHeight={160}>
                <div data-testid="overflow-content">Content</div>
            </OverflowBox>,
        )

        expect(screen.queryByRole('button', { name: /show more/i })).toBeNull()
        expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('renders show more and expands/collapses overflowing content', async () => {
        const { user } = render(
            <OverflowBox nonExpandedMaxHeight={100}>
                <div data-testid="overflow-content">Content</div>
            </OverflowBox>,
        )

        const contentWrapper = screen.getByTestId('overflow-content')
            .parentElement as HTMLDivElement

        expect(
            screen.getByRole('button', { name: /show more/i }),
        ).toBeInTheDocument()
        expect(contentWrapper).toHaveStyle({ maxHeight: '76px' })
        expect(contentWrapper).toHaveStyle({
            overflowX: 'hidden',
            overflowY: 'hidden',
        })

        await user.click(screen.getByRole('button', { name: /show more/i }))

        expect(
            screen.getByRole('button', { name: /show less/i }),
        ).toBeInTheDocument()
        expect(contentWrapper.style.maxHeight).toBe('')
        expect(contentWrapper).toHaveStyle({
            overflowX: 'hidden',
            overflowY: 'visible',
        })
    })
})
