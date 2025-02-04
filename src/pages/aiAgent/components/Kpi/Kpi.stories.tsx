import {StoryObj} from '@storybook/react'

import {StatType} from 'models/stat/types'

import {Kpi} from './Kpi'

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
    metricType: StatType.Number,
}

export const Percent: Story = {}
Percent.args = {
    title: 'Automation Rate',
    value: 0.45,
    prevValue: 0.3,
    metricType: StatType.Percent,
}

export const Currency: Story = {}
Currency.args = {
    title: 'Gross Merchandise Value (GMV) Influenced',
    value: 12345,
    prevValue: 1234,
    metricType: StatType.Currency,
}

export const CurrencyCAD: Story = {}
CurrencyCAD.args = {
    title: 'Gross Merchandise Value (GMV) Influenced',
    value: 12345,
    prevValue: 1234,
    metricType: StatType.Currency,
    currency: 'CAD',
}

export const Zero: Story = {}
Zero.args = {
    title: 'Some KPI',
    value: 0,
    prevValue: 10,
    metricType: StatType.Number,
}

export default storyConfig
