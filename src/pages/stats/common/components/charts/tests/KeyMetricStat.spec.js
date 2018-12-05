import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {OVERVIEW, SATISFACTION_SURVEYS, stats as statsConfig} from '../../../../../../config/stats'
import KeyMetricStat from '../KeyMetricStat'

const barStat = fromJS({
    name: 'overview',
    data: [{
        more_is_better: false,
        delta: 100,
        value: 2220.0,
        type: 'duration',
        name: 'median_first_response_time'
    }, {
        more_is_better: false,
        delta: 100,
        value: 343529.0,
        type: 'duration',
        name: 'median_resolution_time'
    }, {
        more_is_better: true,
        delta: 0,
        value: 20,
        type: 'percent',
        name: 'total_one_touch_tickets'
    }],
    meta: {
        previous_start_datetime: '2017-09-05 00:00:00',
        previous_end_datetime: '2017-09-06 23:59:59',
    }
})

const satisfactionSurveyStat = fromJS({
    name: 'satisfaction-survey',
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

describe('KeyMetricStat', () => {
    it('should render a key metrics chart', () => {
        const config = statsConfig.find((config, key) => key === OVERVIEW)
        const component = shallow(
            <KeyMetricStat
                config={config}
                {...barStat.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a key metrics chart with distribution and donut components', () => {
        const config = statsConfig.find((config, key) => key === SATISFACTION_SURVEYS)
        const component = shallow(
            <KeyMetricStat
                config={config}
                {...satisfactionSurveyStat.toObject()}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
