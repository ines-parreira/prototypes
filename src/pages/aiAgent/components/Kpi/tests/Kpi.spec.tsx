import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'

import React from 'react'

import {StatType} from 'models/stat/types'

import {Kpi} from '../Kpi'

describe('Kpi', () => {
    it('should render the title and formatted value for number metric type', () => {
        render(
            <Kpi
                title="Number KPI"
                value={1500}
                prevValue={1200}
                metricType={StatType.Number}
            />
        )

        expect(screen.getByText('Number KPI')).toBeInTheDocument()
        expect(screen.getByText('1,500')).toBeInTheDocument()
    })

    it('should not render undefined when value is undefined', () => {
        render(<Kpi title="Number KPI" metricType={StatType.Number} />)
        expect(screen.queryByText('undefined')).not.toBeInTheDocument()
    })

    it('should format value as currency when metric type is StatType.Currency and currency not set', () => {
        render(
            <Kpi
                title="Currency KPI"
                value={1234.56}
                prevValue={1000}
                metricType={StatType.Currency}
            />
        )

        expect(screen.getByText('Currency KPI')).toBeInTheDocument()
        expect(screen.getByText('$1,234.56')).toBeInTheDocument()
    })

    it('should format value as currency when metric type is StatType.Currency and currency USD', () => {
        render(
            <Kpi
                title="Currency KPI"
                value={1234.56}
                prevValue={1000}
                metricType={StatType.Currency}
                currency="USD"
            />
        )

        expect(screen.getByText('Currency KPI')).toBeInTheDocument()
        expect(screen.getByText('$1,234.56')).toBeInTheDocument()
    })

    it('should format value as percent when metric type is StatType.Percent', () => {
        render(
            <Kpi
                title="Rate KPI"
                value={87.5}
                prevValue={85}
                metricType={StatType.Percent}
                hint="Conversion hint"
                isLoading={false}
            />
        )

        expect(screen.getByText('Rate KPI')).toBeInTheDocument()
        expect(screen.getByText('87.5%')).toBeInTheDocument()
    })

    it('should format value with 2 numbers after the comma when it is a really long number', () => {
        render(
            <Kpi
                title="Rate KPI"
                value={87.55555555}
                prevValue={85}
                metricType={StatType.Percent}
                hint="Conversion hint"
                isLoading={false}
            />
        )

        expect(screen.getByText('Rate KPI')).toBeInTheDocument()
        expect(screen.getByText('87.56%')).toBeInTheDocument()
    })
})
