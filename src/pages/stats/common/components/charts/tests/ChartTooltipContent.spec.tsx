import {render, screen} from '@testing-library/react'
import React from 'react'

import {ChartTooltipContent} from '../ChartTooltipContent'

describe('<ChartTooltipContent />', () => {
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
        render(<ChartTooltipContent tooltip={tooltip} />)

        expect(screen.getByText(/Label/)).toBeInTheDocument()
    })

    it('should display N/A when showZeroAsNA is true and value is 0', () => {
        const zeroTooltip = {
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
                    formattedValue: '0',
                },
            ],
        } as any

        render(<ChartTooltipContent tooltip={zeroTooltip} showZeroAsNA />)

        expect(screen.getByText('N/A')).toBeInTheDocument()
    })
})
