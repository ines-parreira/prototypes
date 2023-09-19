import React from 'react'
import {render, screen} from '@testing-library/react'

import colors from 'assets/tokens/colors.json'

import Legend from '../Legend'

describe('<Legend />', () => {
    const items = [
        {
            label: 'Foo',
            color: colors['📺 Classic'].Main.Variations.Primary_3.value,
        },
        {
            label: 'Bar',
            color: colors['📺 Classic'].Feedback.Variations.Error_3.value,
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
        const {container} = render(<Legend items={items} />)

        expect(
            container.querySelectorAll("input[type='checkbox']")
        ).toHaveLength(0)
    })
})
