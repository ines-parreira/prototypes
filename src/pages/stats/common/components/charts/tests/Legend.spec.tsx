import { act, render, screen } from '@testing-library/react'

import colors from '@gorgias/design-tokens/tokens/colors'

import { userEvent } from 'utils/testing/userEvent'

import Legend from '../Legend'

describe('<Legend />', () => {
    const items = [
        {
            label: 'Foo',
            color: colors.classic.main.variations.primary_3.value,
        },
        {
            label: 'Bar',
            color: colors.classic.feedback.variations.error_3.value,
        },
    ]

    it('should render the legend', () => {
        render(<Legend items={items} />)

        expect(screen.getByText(items[0].label)).toBeInTheDocument()
    })

    it('should render the checkbox legend', () => {
        render(<Legend items={items} toggleLegend />)

        expect(screen.getAllByRole('checkbox').length).toBe(items.length)
        expect(screen.getByLabelText(items[0].label)).toBeInTheDocument()
    })

    it('should not render the checkbox if toggleLegend is false', () => {
        const { container } = render(<Legend items={items} />)

        expect(
            container.querySelectorAll("input[type='checkbox']"),
        ).toHaveLength(0)
    })

    it('should render the legend with tooltip', async () => {
        const itemsWithTooltip = items.map((item) => ({
            ...item,
            tooltip: 'Tooltip content',
        }))
        render(<Legend items={itemsWithTooltip} />)

        act(() => {
            userEvent.hover(screen.getByText(itemsWithTooltip[0].label))
        })

        expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })

    it('should render  the checkbox legend with tooltip', async () => {
        const itemsWithTooltip = items.map((item) => ({
            ...item,
            tooltip: 'Tooltip content',
        }))
        render(<Legend items={itemsWithTooltip} toggleLegend />)

        act(() => {
            userEvent.hover(screen.getByText(itemsWithTooltip[0].label))
        })

        expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })
})
