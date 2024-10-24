import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import DonutKeyMetricStat from '../KeyMetricStat/DonutKeyMetricStat'

describe('DonutKeyMetricStat', () => {
    const fill = 'success'
    const minProps: ComponentProps<typeof DonutKeyMetricStat> = {
        value: 5.3,
        maxValue: 10,
        fill,
        formattedValue: '',
        label: '',
        differenceComponent: undefined,
    }

    it('should render a donut chart with 2 values', () => {
        render(<DonutKeyMetricStat {...minProps} />)

        const chart = document.querySelector('svg[class*=donut]')
        const emptyPath = document.querySelector('path[class*=empty]')
        const successPath = document.querySelector(`path[class*=${fill}]`)

        expect(chart).toBeInTheDocument()
        expect(emptyPath).toBeInTheDocument()
        expect(successPath).toBeInTheDocument()
        expect(chart?.children.length).toEqual([emptyPath, successPath].length)
    })

    it('should render just 1 path on 0 value', () => {
        render(<DonutKeyMetricStat {...minProps} value={0} />)

        const chart = document.querySelector('svg[class*=donut]')
        const emptyPath = document.querySelector('path[class*=empty]')

        expect(chart).toBeInTheDocument()
        expect(emptyPath).toBeInTheDocument()
        expect(chart?.children.length).toEqual([emptyPath].length)
    })

    it('should render just 1 path on max value', () => {
        const someValue = 100
        render(
            <DonutKeyMetricStat
                {...minProps}
                value={someValue}
                maxValue={someValue}
            />
        )

        const chart = document.querySelector('svg[class*=donut]')
        const successPath = document.querySelector(`path[class*=${fill}]`)

        expect(chart).toBeInTheDocument()
        expect(successPath).toBeInTheDocument()
        expect(chart?.children.length).toEqual([successPath].length)
    })

    it('should render just 1 path on max value', () => {
        const someValue = 100
        render(
            <DonutKeyMetricStat
                {...minProps}
                value={someValue}
                maxValue={someValue}
            />
        )

        const chart = document.querySelector('svg[class*=donut]')
        const successPath = document.querySelector(`path[class*=${fill}]`)

        expect(chart).toBeInTheDocument()
        expect(successPath).toBeInTheDocument()
        expect(chart?.children.length).toEqual([successPath].length)
    })
})
