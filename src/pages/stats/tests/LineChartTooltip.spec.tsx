import React from 'react'
import {render, screen} from '@testing-library/react'

import {LineChartTooltip} from '../LineChartTooltip'

describe('<LineChartTooltip />', () => {
    const tooltip = {
        labelColors: [
            {
                backgroundColor: 'red',
                borderWidth: '1',
                borderColor: 'blue',
                borderRadius: '0',
            },
        ],
        dataPoints: [
            {
                dataset: {
                    label: 'Label',
                },
                formattedValue: 22,
            },
        ],
    } as any

    it('should render the chart line tooltip', () => {
        render(<LineChartTooltip tooltip={tooltip} />)

        expect(screen.getByText(/Label/)).toBeInTheDocument()
    })
})
