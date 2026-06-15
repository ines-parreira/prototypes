import { screen } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { TicketThreadWidthContext } from '../../../../../thread/context/TicketThreadWidth'
import type { BubbleActionItem } from '../BubbleActions'
import { BubbleActions } from '../BubbleActions'

function makeItem(overrides: Partial<BubbleActionItem> = {}): BubbleActionItem {
    return {
        id: 'item',
        icon: <span>icon</span>,
        compactLabel: 'Action',
        onAction: vi.fn(),
        ...overrides,
    }
}

function renderCompact(items: BubbleActionItem[]) {
    return render(
        <TicketThreadWidthContext.Provider value={{ containerWidth: 1 }}>
            <BubbleActions placement="right" items={items} />
        </TicketThreadWidthContext.Provider>,
    )
}

describe('BubbleActions', () => {
    describe('compact mode', () => {
        it('renders a More actions trigger button', () => {
            renderCompact([makeItem()])

            expect(
                screen.getByRole('radio', { name: 'More actions' }),
            ).toBeInTheDocument()
        })

        it('renders the compactAnchor content hidden from the accessibility tree', () => {
            const item = makeItem({
                id: 'with-anchor',
                compactAnchor: <div>Anchor content</div>,
            })
            renderCompact([item])

            const anchorContent = screen.getByText('Anchor content')
            expect(
                anchorContent.closest('[aria-hidden="true"]'),
            ).toBeInTheDocument()
        })

        it('renders compactAnchor only for items that have one', () => {
            const items: BubbleActionItem[] = [
                makeItem({
                    id: 'with-anchor',
                    compactLabel: 'With anchor',
                    compactAnchor: <div>Anchor text</div>,
                }),
                makeItem({
                    id: 'without-anchor',
                    compactLabel: 'Without anchor',
                }),
            ]
            renderCompact(items)

            expect(screen.getByText('Anchor text')).toBeInTheDocument()
            // The label of the item without an anchor is not in the DOM until the menu opens
            expect(screen.queryByText('Without anchor')).not.toBeInTheDocument()
        })
    })
})
