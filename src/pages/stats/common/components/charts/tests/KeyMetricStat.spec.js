import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {OVERVIEW, REVENUE_OVERVIEW, SATISFACTION_SURVEYS, stats as statsConfig} from '../../../../../../config/stats'
import KeyMetricStat from '../KeyMetricStat'

describe('KeyMetricStat', () => {
    it('should render a key metrics chart (splitted key metrics)', () => {
        const config = statsConfig.find((config, key) => key === OVERVIEW)
        const splittedKeyMetricsStat = fromJS({
            data: {
                'median-resolution-time': {
                    data: {
                        more_is_better: false,
                        delta: 100,
                        value: 343529.0,
                        type: 'duration',
                        name: 'median_resolution_time'
                    },
                    meta: {
                        start_datetime: '2019-07-06 00:00:00',
                        end_datetime: '2019-10-03 23:59:59',
                        previous_start_datetime: '2019-04-07 00:00:01',
                        previous_end_datetime: '2019-07-06 00:00:00'
                    }
                },
                'total-messages-sent': {
                    data: {
                        delta: 0,
                        value: 20,
                        type: 'number',
                        name: 'total_messages_sent'
                    }
                },
                meta: {
                    start_datetime: '2019-07-06 00:00:00',
                    end_datetime: '2019-10-03 23:59:59',
                    previous_start_datetime: '2019-04-07 00:00:01',
                    previous_end_datetime: '2019-07-06 00:00:00'
                }
            }
        })
        const component = shallow(
            <KeyMetricStat
                config={config}
                {...splittedKeyMetricsStat.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a key metrics chart (grouped key metrics)', () => {
        const config = statsConfig.find((config, key) => key === REVENUE_OVERVIEW)
        const groupedKeyMetricsStat = fromJS({
            data: [{
                name: 'pre_sale_tickets',
                type: 'number',
                value: 833,
                delta: 52,
                more_is_better: true
            }, {
                name: 'converted_tickets',
                type: 'number',
                value: 153,
                delta: 43,
                more_is_better: true
            }],
            meta: {
                start_datetime: '2019-07-06 00:00:00',
                end_datetime: '2019-10-03 23:59:59',
                previous_start_datetime: '2019-04-07 00:00:01',
                previous_end_datetime: '2019-07-06 00:00:00'
            }
        })
        const component = shallow(
            <KeyMetricStat
                config={config}
                {...groupedKeyMetricsStat.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a key metrics chart with distribution and donut components', () => {
        const config = statsConfig.find((config, key) => key === SATISFACTION_SURVEYS)
        const satisfactionSurveyStat = fromJS({
            data: [
                {
                    delta: 10,
                    value: 20,
                    type: 'donut',
                    name: 'average_rating'
                }, {
                    value: {
                        1: 12.00,
                        2: 38.00,
                        3: 14.50,
                        4: 14.50,
                        5: 21.00
                    },
                    type: 'distribution',
                    name: 'response_distribution'
                }],
            meta: {
                previous_start_datetime: '2017-09-05 00:00:00',
                previous_end_datetime: '2017-09-06 23:59:59',
            }
        })

        const component = shallow(
            <KeyMetricStat
                config={config}
                {...satisfactionSurveyStat.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
