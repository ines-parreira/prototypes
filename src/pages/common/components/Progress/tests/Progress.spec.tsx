import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import Progress from '../Progress'

const defaultProps: ComponentProps<typeof Progress> = {
    barType: 'primary',
    labelType: 'percentage',
    value: 70,
    maxValue: 100,
    thresholds: {
        success: {
            low: 61,
            high: 100,
        },
        warning: {
            low: 31,
            high: 60,
        },
        error: {
            low: 0,
            high: 30,
        },
    },
}

describe('<Progress />', () => {
    it('should render a progress bar of different types', () => {
        const {container, rerender} = render(
            <Progress {...defaultProps} barType="secondary" />
        )

        expect(container.querySelector('.secondary')).toBeTruthy()

        rerender(<Progress {...defaultProps} barType="warning" />)
        expect(container.querySelector('.warning')).toBeTruthy()

        rerender(<Progress {...defaultProps} barType="error" />)
        expect(container.querySelector('.error')).toBeTruthy()
    })

    it('should render different progress bars for the threshold type', () => {
        const {container, rerender} = render(
            <Progress {...defaultProps} barType="threshold" />
        )

        expect(container.querySelector('.success')).toBeTruthy()

        rerender(<Progress {...defaultProps} barType="threshold" value={20} />)
        expect(container.querySelector('.error')).toBeTruthy()

        rerender(
            <Progress
                {...defaultProps}
                thresholds={{
                    secondary: {low: 0, high: 99},
                    primary: {low: 100, high: 100},
                }}
                barType="threshold"
                value={99}
            />
        )
        expect(container.querySelector('.secondary')).toBeTruthy()
    })

    it('should render different progress bars for the threshold type with reversed thresholds', () => {
        const props = {
            ...defaultProps,
            barType: 'threshold',
            thresholds: {
                error: {
                    low: 60,
                    high: 100,
                },
                warning: {
                    low: 30,
                    high: 60,
                },
                success: {
                    low: 0,
                    high: 30,
                },
            },
        } as const

        const {container} = render(<Progress {...props} value={20} />)
        expect(container.querySelector('.success')).toBeTruthy()
    })
})
