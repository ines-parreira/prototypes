import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import SankeyStat from '../SankeyStat'

jest.mock('react-chartjs-2', () => (props: Record<string, unknown>) => (
    <canvas {...props} />
))

const minProps: ComponentProps<typeof SankeyStat> = {
    data: fromJS([
        {from: 'foo', to: 'bar', flow: 10},
        {from: 'foo', to: 'baz', flow: 20},
        {from: 'bar', to: 'baz', flow: 30},
    ]),
    legend: fromJS({
        labels: {foo: 'Foo', bar: 'Bar', baz: 'Baz'},
    }),
    config: fromJS({
        colorMap: {
            foo: '#ff0000',
            bar: '#00ff00',
            baz: '#0000ff',
        },
        priority: {
            foo: 1,
            bar: 2,
            baz: 1,
        },
        options: () => {
            return {
                animation: false,
            }
        },
    }),
}

describe('<SankeyStat />', () => {
    it('should display text when no data is found', () => {
        const {container} = render(
            <SankeyStat {...minProps} data={fromJS([])} />
        )
        expect(container).toMatchSnapshot()
    })
    it('should display text when there is no flow', () => {
        const {container} = render(
            <SankeyStat
                {...minProps}
                data={fromJS([{from: 'foo', to: 'bar', flow: 0}])}
            />
        )
        expect(container).toMatchSnapshot()
    })
    it('should display sankey diagram when data is found', () => {
        const {container} = render(<SankeyStat {...minProps} />)
        expect(container).toMatchSnapshot()
    })
})
