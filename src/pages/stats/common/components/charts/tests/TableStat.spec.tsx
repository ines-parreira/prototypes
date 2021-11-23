import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS, Map} from 'immutable'

import {TableStat} from '../TableStat/TableStat'
import {
    stats as statsConfig,
    StatValueType,
    TICKETS_PER_TAG,
} from '../../../../../../config/stats'

const tableStatData = fromJS({
    data: {
        axes: {
            x: [
                {
                    name: 'Agent',
                    type: StatValueType.User,
                },
                {
                    name: 'Tags',
                    type: StatValueType.String,
                },
                {
                    name: 'New tickets #',
                    type: StatValueType.Number,
                },
                {
                    name: 'Percent',
                    type: StatValueType.Percent,
                },
                {
                    name: 'Agent Score',
                    type: StatValueType.SatisfactionScore,
                },
                {
                    name: 'Survey Score',
                    type: StatValueType.SatisfactionScore,
                },
                {
                    name: 'Delta',
                    type: StatValueType.Delta,
                },
                {
                    name: 'Sales',
                    type: StatValueType.Currency,
                    currency: 'AUD',
                },
                {name: 'Online time', type: StatValueType.OnlineTime},
                {name: 'Ticket details', type: StatValueType.TicketDetails},
                {name: 'Customer link', type: StatValueType.CustomerLink},
                {
                    name: 'Customer link - null',
                    type: StatValueType.CustomerLink,
                },
                {
                    name: 'Satisfaction survey link',
                    type: StatValueType.SatisfactionSurveyLink,
                },
                {
                    name: 'Satisfaction survey link - null',
                    type: StatValueType.SatisfactionSurveyLink,
                },
                {
                    name: 'Satisfaction survey link - empty space comment',
                    type: StatValueType.SatisfactionSurveyLink,
                },
            ],
        },
        lines: [
            [
                {
                    type: StatValueType.User,
                    value: {id: 1, name: 'Foo'},
                },
                {
                    type: StatValueType.String,
                    value: 'refund',
                },
                {
                    type: StatValueType.Number,
                    value: 42,
                },
                {
                    type: StatValueType.Percent,
                    value: 12,
                },
                {
                    type: StatValueType.SatisfactionScore,
                    value: 93,
                },
                {
                    type: StatValueType.SatisfactionScore,
                    value: 3,
                },
                {
                    type: StatValueType.Delta,
                    value: -1,
                },
                {
                    type: StatValueType.Currency,
                    value: 3.5,
                },
                {
                    type: StatValueType.Duration,
                    value: 16043,
                    extra: {
                        timezone: 'US/Pacific',
                        isOnline: true,
                        firstSession: '2021-08-02T09:55:28.902155',
                        lastSession: null,
                    },
                },
                {
                    type: StatValueType.Object,
                    value: 51,
                    details: {
                        aircall: 10,
                        api: 10,
                        chat: 10,
                        email: 11,
                        facebook: 10,
                        'facebook-mention': 5,
                        'facebook-messenger': 5,
                        'facebook-recommendations': 5,
                        'instagram-ad-comment': 10,
                        'instagram-comment': 5,
                        'instagram-mention': 10,
                        'instagram-direct-message': 5,
                        'internal-note': 10,
                        phone: 10,
                        sms: 10,
                        twitter: 10,
                        'twitter-direct-message': 5,
                        'yotpo-review': 10,
                    },
                },
                {
                    type: StatValueType.CustomerLink,
                    customer_id: 1,
                    customer_name: 'John Doe',
                },
                {
                    type: StatValueType.CustomerLink,
                    customer_id: 1,
                    customer_name: null,
                },
                {
                    comment: 'Foo',
                    ticket_id: 1,
                    type: StatValueType.SatisfactionSurveyLink,
                },
                {
                    comment: null,
                    ticket_id: 1,
                    type: StatValueType.SatisfactionSurveyLink,
                },
                {
                    comment: '     ',
                    ticket_id: 1,
                    type: StatValueType.SatisfactionSurveyLink,
                },
            ],
        ],
    },
    name: 'tickets_per_tag',
    label: 'Tickets per tag',
    meta: {
        previous_start_datetime: '2018-10-22',
        previous_end_datetime: '2018-10-23',
    },
}) as Map<any, any>
const tableStatNoData = fromJS({
    data: {
        lines: [],
    },
    meta: {},
}) as Map<any, any>

describe('TableStat', () => {
    it('should render a table chart', () => {
        const config = statsConfig.find(
            (config, key) => key === TICKETS_PER_TAG
        )
        const component = shallow(
            <TableStat
                {...(tableStatData.toObject() as ComponentProps<
                    typeof TableStat
                >)}
                context={{tagColors: null}}
                config={config}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a table chart with "no data" message', () => {
        const config = statsConfig.find(
            (config, key) => key === TICKETS_PER_TAG
        )
        const component = shallow(
            <TableStat
                {...(tableStatNoData.toObject() as ComponentProps<
                    typeof TableStat
                >)}
                context={{tagColors: null}}
                config={config}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
