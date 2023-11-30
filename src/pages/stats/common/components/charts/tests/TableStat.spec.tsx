import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'
import {act, render, screen} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {Integration} from 'models/integration/types'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {initialState} from 'state/tags/reducers'
import {
    stats as statsConfig,
    StatValueType,
    TICKETS_PER_TAG,
} from 'config/stats'
import * as channelsService from 'services/channels'
import {channels} from 'fixtures/channels'

import {TableStat} from '../TableStat/TableStat'

jest.spyOn(channelsService, 'getChannels').mockReturnValue(channels)

const mockStore = configureMockStore()

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
                {
                    name: 'Title with link',
                    type: StatValueType.TitleWithLink,
                },
                {
                    name: 'Title for Quick Response',
                    type: StatValueType.QuickResponseTitle,
                },
                {
                    name: 'Quick Response automation rate',
                    type: StatValueType.QuickResponseAutomationRate,
                },
                {
                    name: 'Article Recommendation automation rate',
                    type: StatValueType.ArticleRecommendationAutomationRate,
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
                {
                    value: {title: 'Article Title', url: 'fake url'},
                    type: StatValueType.TitleWithLink,
                },
                {
                    value: 'title',
                    shop_integration_id: 1,
                    flow_id: 'fakeflowId',
                    type: StatValueType.QuickResponseTitle,
                },
                {
                    value: 30,
                    shop_integration_id: 1,
                    flow_id: 'fakeflowId',
                    type: StatValueType.QuickResponseAutomationRate,
                },
                {
                    value: 30,
                    type: StatValueType.ArticleRecommendationAutomationRate,
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

const integrationsData = [
    {
        id: 1,
        type: 'shopify',
        name: 'test-shop',
        meta: {
            shop_name: 'test-shop',
        },
    } as Integration,
]

const selfServiceConfigurationsData = [
    {
        shop_name: 'test-shop',
        type: 'shopify',
        quick_response_policies: [
            {
                id: 'fakeflowId',
                deactivated_datetime: null,
            },
        ],
    } as SelfServiceConfiguration,
]

describe('TableStat', () => {
    const defaultState = {entities: {tags: initialState}}
    it('should render a table chart', () => {
        const config = statsConfig.find(
            (config, key) => key === TICKETS_PER_TAG
        )
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TableStat
                    {...(tableStatData.toObject() as ComponentProps<
                        typeof TableStat
                    >)}
                    context={{tagColors: null}}
                    config={config}
                    integrations={integrationsData}
                    selfServiceConfigurations={selfServiceConfigurationsData}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a table chart with "no data" message', () => {
        const config = statsConfig.find(
            (config, key) => key === TICKETS_PER_TAG
        )
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TableStat
                    {...(tableStatNoData.toObject() as ComponentProps<
                        typeof TableStat
                    >)}
                    context={{tagColors: null}}
                    config={config}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a table with the expand button and one line visible', () => {
        const config = {
            ...statsConfig
                .find((config, key) => key === TICKETS_PER_TAG)
                .toJS(),
            tableOptions: {showLines: 1},
        }
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TableStat
                    {...(tableStatData
                        .setIn(
                            ['data', 'lines'],
                            fromJS([
                                tableStatData.getIn(['data', 'lines', 0]),
                                tableStatData.getIn(['data', 'lines', 0]),
                            ])
                        )
                        .toObject() as ComponentProps<typeof TableStat>)}
                    context={{tagColors: null}}
                    config={fromJS(config)}
                    integrations={integrationsData}
                    selfServiceConfigurations={selfServiceConfigurationsData}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should extend the table to show all the elements', () => {
        const config = {
            ...statsConfig
                .find((config, key) => key === TICKETS_PER_TAG)
                .toJS(),
            tableOptions: {showLines: 1},
        }
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TableStat
                    {...(tableStatData
                        .setIn(
                            ['data', 'lines'],
                            fromJS([
                                tableStatData.getIn(['data', 'lines', 0]),
                                tableStatData.getIn(['data', 'lines', 0]),
                            ])
                        )
                        .toObject() as ComponentProps<typeof TableStat>)}
                    context={{tagColors: null}}
                    config={fromJS(config)}
                    integrations={integrationsData}
                    selfServiceConfigurations={selfServiceConfigurationsData}
                />
            </Provider>
        )

        act(() => {
            userEvent.click(screen.getByRole('button'))
        })

        expect(container.firstChild).toMatchSnapshot()
    })
})
