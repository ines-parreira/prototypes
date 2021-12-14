import React from 'react'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {
    OVERVIEW,
    REVENUE_OVERVIEW,
    SATISFACTION_SURVEYS,
    stats as statsConfig,
} from '../../../../../../config/stats.tsx'
import KeyMetricStat from '../KeyMetricStat'

describe('KeyMetricStat', () => {
    const minProps = {
        loading: false,
    }

    it('should render a key metrics chart (splitted key metrics)', () => {
        const config = statsConfig.find((config, key) => key === OVERVIEW)
        const splittedKeyMetricsStat = fromJS({
            data: [
                {
                    api_resource_name: 'median-resolution-time',
                    more_is_better: false,
                    delta: 100,
                    value: 343529.0,
                    type: 'duration',
                    name: 'median_resolution_time',
                },
                {
                    api_resource_name: 'total-messages-sent',
                    delta: 0,
                    value: 20,
                    type: 'number',
                    name: 'total_messages_sent',
                },
            ],
            meta: {
                start_datetime: '2019-07-06 00:00:00',
                end_datetime: '2019-10-03 23:59:59',
                previous_start_datetime: '2019-04-07 00:00:01',
                previous_end_datetime: '2019-07-06 00:00:00',
            },
        })
        const {container} = render(
            <KeyMetricStat
                {...minProps}
                config={config}
                {...splittedKeyMetricsStat.toObject()}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render a key metrics chart (grouped key metrics)', () => {
        const config = statsConfig.find(
            (config, key) => key === REVENUE_OVERVIEW
        )
        const groupedKeyMetricsStat = fromJS({
            data: [
                {
                    name: 'tickets_created',
                    type: 'number',
                    value: 833,
                    delta: 52,
                    more_is_better: true,
                },
                {
                    name: 'tickets_converted',
                    type: 'number',
                    value: 153,
                    delta: 43,
                    more_is_better: true,
                },
                {
                    name: 'conversion_ratio',
                    type: 'percent',
                    value: 50.0,
                    delta: 10,
                    more_is_better: true,
                },
                {
                    name: 'total_sales_from_support',
                    type: 'currency',
                    currency: 'EUR',
                    value: 42.0,
                    delta: 21,
                    more_is_better: true,
                },
            ],
            meta: {
                start_datetime: '2019-07-06 00:00:00',
                end_datetime: '2019-10-03 23:59:59',
                previous_start_datetime: '2019-04-07 00:00:01',
                previous_end_datetime: '2019-07-06 00:00:00',
            },
        })
        const {container} = render(
            <KeyMetricStat
                {...minProps}
                config={config}
                {...groupedKeyMetricsStat.toObject()}
            />
        )
        expect(container).toMatchSnapshot()
    })

    it('should render a key metrics chart with distribution and donut components', () => {
        const config = statsConfig.find(
            (config, key) => key === SATISFACTION_SURVEYS
        )
        const satisfactionSurveyStat = fromJS({
            data: [
                {
                    delta: 10,
                    value: 20,
                    type: 'donut',
                    name: 'average_rating',
                },
                {
                    value: {
                        1: 12.0,
                        2: 38.0,
                        3: 14.5,
                        4: 14.5,
                        5: 21.0,
                    },
                    type: 'distribution',
                    name: 'response_distribution',
                },
            ],
            meta: {
                previous_start_datetime: '2017-09-05 00:00:00',
                previous_end_datetime: '2017-09-06 23:59:59',
            },
        })

        const {container} = render(
            <KeyMetricStat
                {...minProps}
                config={config}
                {...satisfactionSurveyStat.toObject()}
            />
        )
        expect(container).toMatchSnapshot()
    })
})
