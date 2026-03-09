import type { StoryObj } from 'storybook-react-rsbuild'

import { Kpi } from './Kpi'

const storyConfig = {
    title: 'AI Agent/Overview/KPI',
    component: Kpi,
}

type Story = StoryObj<typeof Kpi>

export const Number: Story = {}
Number.args = {
    title: 'Automated Interactions',
    value: 2920,
    prevValue: 3241,
    metricFormat: 'decimal',
}

export const Percent: Story = {}
Percent.args = {
    title: 'Automation Rate',
    value: 0.45,
    prevValue: 0.3,
    metricFormat: 'decimal-to-percent',
}

export const Currency: Story = {}
Currency.args = {
    title: 'Gross Merchandise Value (GMV) Influenced',
    value: 12345,
    prevValue: 1234,
}

export const CurrencyCAD: Story = {}
CurrencyCAD.args = {
    title: 'Gross Merchandise Value (GMV) Influenced',
    value: 12345,
    prevValue: 1234,
    currency: 'CAD',
}

export const Zero: Story = {}
Zero.args = {
    title: 'Some KPI',
    value: 0,
    prevValue: 10,
}

export const Skeleton: Story = {}
Skeleton.args = {
    isLoading: true,
}

export default storyConfig
