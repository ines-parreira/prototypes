import '@testing-library/jest-dom'

import React from 'react'

import { render, screen } from '@testing-library/react'

import { Kpi } from '../Kpi'

describe('Kpi', () => {
    it('should render the title and formatted value for number metric type', () => {
        render(
            <Kpi
                title="Number KPI"
                value={1500}
                prevValue={1200}
                metricFormat="decimal"
            />,
        )

        expect(screen.getByText('Number KPI')).toBeInTheDocument()
        expect(screen.getByText('1,500')).toBeInTheDocument()
    })

    it('should not render undefined when value is undefined', () => {
        render(<Kpi title="Number KPI" />)
        expect(screen.queryByText('undefined')).not.toBeInTheDocument()
    })

    it('should format value as currency when metric type is StatType.Currency and currency not set', () => {
        render(
            <Kpi
                title="Currency KPI"
                value={1234.56}
                prevValue={1000}
                metricFormat="currency"
            />,
        )

        expect(screen.getByText('Currency KPI')).toBeInTheDocument()
        expect(screen.getByText('$1,234.56')).toBeInTheDocument()
    })

    it('should format value as currency when metric type is StatType.Currency and currency JPY', () => {
        render(
            <Kpi
                title="Currency KPI"
                value={1234.56}
                prevValue={1000}
                metricFormat="currency"
                currency="JPY"
            />,
        )

        expect(screen.getByText('Currency KPI')).toBeInTheDocument()
        expect(screen.getByText('¥1,234.56')).toBeInTheDocument()
    })

    it('should format value with 2 numbers after the comma when it is a really long number', () => {
        render(
            <Kpi
                title="Rate KPI"
                value={0.8755555555}
                prevValue={0.85}
                metricFormat="decimal-to-percent"
                hint={{ title: 'Conversion hint' }}
                isLoading={false}
            />,
        )

        expect(screen.getByText('Rate KPI')).toBeInTheDocument()
        expect(screen.getByText('87.56%')).toBeInTheDocument()
    })

    it('should show the trend by default', () => {
        render(
            <Kpi
                title="Some KPI"
                value={100}
                prevValue={20}
                metricFormat="decimal"
                isLoading={false}
                hideTrend={false}
            />,
        )

        expect(screen.getByText('400%')).toBeInTheDocument()
    })

    it('should hide the trend by default', () => {
        render(
            <Kpi
                title="Some KPI"
                value={100}
                prevValue={20}
                metricFormat="decimal"
                isLoading={false}
                hideTrend
            />,
        )

        expect(screen.queryByText('400%')).not.toBeInTheDocument()
    })

    it('should render the action', () => {
        render(
            <Kpi
                title="Some KPI"
                value={100}
                prevValue={20}
                metricFormat="decimal"
                isLoading={false}
                hideTrend
                action={<div>Action</div>}
            />,
        )

        expect(screen.getByText('Action')).toBeInTheDocument()
    })
})
