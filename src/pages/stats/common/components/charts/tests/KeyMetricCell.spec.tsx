import React from 'react'

import { render } from '@testing-library/react'
import { Map } from 'immutable'

import { LIVE_OVERVIEW_METRICS, stats } from 'config/stats'

import {
    NO_VALUE_PLACEHOLDER,
    renderValue,
} from '../KeyMetricStat/KeyMetricCell'

const MockDonutKeyMetricStat = jest.fn()
jest.mock('../KeyMetricStat/DistributionKeyMetricStat', () => (props: any) => {
    MockDonutKeyMetricStat(props)
    return <div />
})

beforeEach(() => {
    jest.resetAllMocks()
})

describe('KeyMetricCell', () => {
    describe('renderValue', () => {
        it('should return placeholder if no data provided', () => {
            const config = stats.get(LIVE_OVERVIEW_METRICS)

            expect(renderValue(config, null, 'someString', null)).toEqual(
                NO_VALUE_PLACEHOLDER,
            )
        })

        it('should render the value with formatter from stats config', () => {
            const config = stats.get(LIVE_OVERVIEW_METRICS)
            const values = [1, 2]
            const metric = Map({
                lines: {},
                value: values,
            })

            const returned = renderValue(config, metric, 'someString', null)
            expect(returned).not.toBeInstanceOf(String)
            if (typeof returned !== 'string') {
                render(returned)
            }

            expect(MockDonutKeyMetricStat).toHaveBeenCalledWith({
                config,
                formattedValue: Map(
                    values.map((value, i) => [String(i), value]),
                ),
            })
        })
    })
})
