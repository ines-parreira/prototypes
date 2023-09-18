import React from 'react'
import {render} from '@testing-library/react'

import {Chart} from 'chart.js'
import colors from 'assets/tokens/colors.json'

import Legend from '../Legend'

describe('<Legend />', () => {
    it('should render the legend', () => {
        const {container} = render(
            <Legend
                items={[
                    {
                        label: 'Foo',
                        color: colors['📺 Classic'].Main.Variations.Primary_3
                            .value,
                    },
                    {
                        label: 'Bar',
                        color: colors['📺 Classic'].Feedback.Variations.Error_3
                            .value,
                    },
                ]}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the checkbox legend', () => {
        const items = [
            {
                label: 'Foo',
                color: colors['📺 Classic'].Main.Variations.Primary_3.value,
                index: 0,
            },
            {
                label: 'Bar',
                color: colors['📺 Classic'].Feedback.Variations.Error_3.value,
                index: 1,
            },
        ]
        const {container} = render(
            <Legend chart={{} as Chart} toggleLegend items={items} />
        )

        expect(
            container.querySelectorAll("input[type='checkbox']")
        ).toHaveLength(items.length)
    })

    it('should not render the checkbox if chart object is null', () => {
        const items = [
            {
                label: 'Foo',
                color: colors['📺 Classic'].Main.Variations.Primary_3.value,
                index: 0,
            },
            {
                label: 'Bar',
                color: colors['📺 Classic'].Feedback.Variations.Error_3.value,
                index: 1,
            },
        ]
        const {container} = render(<Legend toggleLegend items={items} />)

        expect(
            container.querySelectorAll("input[type='checkbox']")
        ).toHaveLength(0)
    })

    it('should not render the checkbox if toggleLegend is false', () => {
        const items = [
            {
                label: 'Foo',
                color: colors['📺 Classic'].Main.Variations.Primary_3.value,
                index: 0,
            },
            {
                label: 'Bar',
                color: colors['📺 Classic'].Feedback.Variations.Error_3.value,
                index: 1,
            },
        ]
        const {container} = render(<Legend items={items} />)

        expect(
            container.querySelectorAll("input[type='checkbox']")
        ).toHaveLength(0)
    })
})
