import {
    SankeyDiagram,
    OneDimensionalChart,
    OneDimensionalUnionChart,
    Stat,
    StatType,
    TwoDimensionalChart,
} from '../models/stat/types'

export const totalMessagesSent: Stat<OneDimensionalChart> = {
    data: {
        data: {
            name: 'total_messages_sent',
            type: StatType.Number,
            value: 30,
            delta: -42,
        },
    },
    meta: {
        start_datetime: '2021-04-28T00:00:00-05:00',
        previous_start_datetime: '2021-03-29T00:00:01-05:00',
        end_datetime: '2021-05-27T23:59:59-05:00',
        previous_end_datetime: '2021-04-28T00:00:00-05:00',
    },
}

export const supportVolume: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Support volume',
        legend: {
            axes: {
                x: 'Creation date',
                y: 'Number of tickets',
            },
        },
        data: {
            axes: {
                x: [1637190000, 1637276400],
                y: [],
            },
            lines: [
                {
                    name: 'created',
                    data: [6, 4],
                },
                {
                    name: 'replied',
                    data: [3, 0],
                },
                {
                    name: 'closed',
                    data: [0, 0],
                },
            ],
        },
    },
    meta: {
        end_datetime: '2021-12-17T23:59:59+01:00',
        start_datetime: '2021-11-18T00:00:00+01:00',
        previous_start_datetime: '2021-10-19T00:00:01+01:00',
        previous_end_datetime: '2021-11-18T00:00:00+01:00',
    },
}

export const resolutionTime: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Resolution time (percentiles)',
        legend: {
            axes: {
                x: '',
                y: 'Resolution time',
            },
        },
        data: {
            axes: {
                x: [1637190000, 1637276400],
                y: [],
            },
            lines: [
                {
                    name: '50%',
                    data: [0, 0],
                },
                {
                    name: '90%',
                    data: [0, 0],
                },
            ],
        },
    },
    meta: {
        end_datetime: '2021-12-17T23:59:59+01:00',
        start_datetime: '2021-11-18T00:00:00+01:00',
        previous_start_datetime: '2021-10-19T00:00:01+01:00',
        previous_end_datetime: '2021-11-18T00:00:00+01:00',
    },
}

export const firstResponseTime: Stat<TwoDimensionalChart> = {
    data: {
        label: 'First response time (percentiles)',
        legend: {axes: {x: '', y: 'First response time'}},
        data: {
            axes: {
                x: [
                    1558760400.0, 1558846800.0, 1558933200.0, 1559019600.0,
                    1559106000.0, 1559192400.0, 1559278800.0,
                ],
                y: [],
            },
            lines: [
                {name: '50%', data: [0.0, 0.0, 0.0, 0.0, 1563.0, 44772.0, 0.0]},
                {name: '90%', data: [0.0, 0.0, 0.0, 0.0, 1563.0, 80567.0, 0.0]},
            ],
        },
    },
    meta: {
        previous_end_datetime: '2019-05-25T00:00:00-05:00',
        previous_start_datetime: '2019-05-18T00:00:01-05:00',
        end_datetime: '2019-05-31T23:59:59-05:00',
        start_datetime: '2019-05-25T00:00:00-05:00',
    },
}

export const ticketsCreatedPerHourPerWeekday: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Busiest time of the week',
        data: {
            axes: {
                x: [
                    {
                        name: 'Hour',
                        type: StatType.String,
                    },
                    {
                        name: 'Monday',
                        type: StatType.Number,
                        value: 1,
                    },
                    {
                        name: 'Tuesday',
                        type: StatType.Number,
                        value: 2,
                    },
                    {
                        name: 'Wednesday',
                        type: StatType.Number,
                        value: 3,
                    },
                    {
                        name: 'Thursday',
                        type: StatType.Number,
                        value: 4,
                    },
                    {
                        name: 'Friday',
                        type: StatType.Number,
                        value: 5,
                    },
                    {
                        name: 'Saturday',
                        type: StatType.Number,
                        value: 6,
                    },
                    {
                        name: 'Sunday',
                        type: StatType.Number,
                        value: 7,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.String,
                        value: '00:00',
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Number,
                        value: 2,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                ],
            ],
        },
    },
    meta: {
        end_datetime: '2021-12-17T23:59:59+01:00',
        start_datetime: '2021-11-18T00:00:00+01:00',
        previous_start_datetime: '2021-10-19T00:00:01+01:00',
        previous_end_datetime: '2021-11-18T00:00:00+01:00',
    },
}

export const ticketsPerTagStat: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Tickets created per tag',
        data: {
            axes: {
                x: [
                    {
                        name: 'Tag',
                        type: StatType.String,
                    },
                    {
                        name: 'Total',
                        type: StatType.Number,
                    },
                    {
                        name: 'Percentage',
                        type: StatType.Percent,
                    },
                    {
                        name: 'Delta',
                        type: StatType.Delta,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.String,
                        value: 'Untagged',
                    },
                    {
                        type: StatType.Number,
                        value: 44,
                    },
                    {
                        type: StatType.Percent,
                        value: 98,
                    },
                    {
                        type: StatType.Delta,
                        value: -40,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'rejected',
                    },
                    {
                        type: StatType.Number,
                        value: 1,
                    },
                    {
                        type: StatType.Percent,
                        value: 2,
                    },
                    {
                        type: StatType.Delta,
                        value: 100,
                    },
                ],
            ],
        },
    },
    meta: {
        previous_start_datetime: '2021-11-11T00:00:01+01:00',
        start_datetime: '2021-11-18T00:00:00+01:00',
        end_datetime: '2021-11-24T23:59:59+01:00',
        previous_end_datetime: '2021-11-18T00:00:00+01:00',
    },
}

export const channelsPerTagStat: Stat<TwoDimensionalChart> = {
    meta: {
        start_datetime: '2021-11-24T00:00:00+01:00',
        previous_end_datetime: '2021-11-24T00:00:00+01:00',
        end_datetime: '2021-11-30T23:59:59+01:00',
        previous_start_datetime: '2021-11-17T00:00:01+01:00',
    },
    data: {
        label: 'Tickets created per channel',
        data: {
            axes: {
                x: [
                    {
                        name: 'Channel',
                        type: StatType.String,
                    },
                    {
                        name: 'Total',
                        type: StatType.Number,
                    },
                    {
                        name: 'Percentage',
                        type: StatType.Percent,
                    },
                    {
                        name: 'Delta',
                        type: StatType.Delta,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.String,
                        value: 'Chat',
                    },
                    {
                        type: StatType.Number,
                        value: 2,
                    },
                    {
                        type: StatType.Percent,
                        value: 13,
                    },
                    {
                        type: StatType.Delta,
                        value: -78,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Email',
                    },
                    {
                        type: StatType.Number,
                        value: 9,
                    },
                    {
                        type: StatType.Percent,
                        value: 60,
                    },
                    {
                        type: StatType.Delta,
                        value: -36,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Instagram Direct Message',
                    },
                    {
                        type: StatType.Number,
                        value: 4,
                    },
                    {
                        type: StatType.Percent,
                        value: 27,
                    },
                    {
                        type: StatType.Delta,
                        value: 100,
                    },
                ],
            ],
        },
    },
}

export const ticketsCreatedPerChannelPerDay: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Tickets created per channel per day',
        legend: {
            axes: {
                x: 'Creation date',
                y: 'Number of tickets',
            },
        },
        data: {
            axes: {
                x: [
                    1638831600, 1638918000, 1639004400, 1639090800, 1639177200,
                    1639263600, 1639350000,
                ],
                y: [],
            },
            lines: [
                {
                    name: 'chat',
                    data: [235, 219, 247, 216, 60, 62, 191],
                },
                {
                    name: 'email',
                    data: [240, 325, 289, 513, 132, 131, 225],
                },
                {
                    name: 'facebook-mention',
                    data: [2, 1, 2, 0, 0, 0, 2],
                },
                {
                    name: 'facebook-messenger',
                    data: [0, 1, 0, 0, 0, 0, 0],
                },
                {
                    name: 'instagram-direct-message',
                    data: [0, 0, 2, 0, 1, 0, 0],
                },
                {
                    name: 'instagram-mention',
                    data: [0, 3, 1, 0, 0, 0, 1],
                },
            ],
        },
    },
    meta: {
        previous_end_datetime: '2021-12-07T00:00:00+01:00',
        start_datetime: '2021-12-07T00:00:00+01:00',
        previous_start_datetime: '2021-11-30T00:00:01+01:00',
        end_datetime: '2021-12-13T23:59:59+01:00',
    },
}

export const ticketsCreatedPerChannel: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Tickets created per channel',
        data: {
            axes: {
                x: [
                    {
                        name: 'Channel',
                        type: StatType.String,
                    },
                    {
                        name: 'Total',
                        type: StatType.Number,
                    },
                    {
                        name: 'Percentage',
                        type: StatType.Percent,
                    },
                    {
                        name: 'Delta',
                        type: StatType.Delta,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.String,
                        value: 'Chat',
                    },
                    {
                        type: StatType.Number,
                        value: 1230,
                    },
                    {
                        type: StatType.Percent,
                        value: 40,
                    },
                    {
                        type: StatType.Delta,
                        value: -2,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Email',
                    },
                    {
                        type: StatType.Number,
                        value: 1855,
                    },
                    {
                        type: StatType.Percent,
                        value: 60,
                    },
                    {
                        type: StatType.Delta,
                        value: 4,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Facebook Mention',
                    },
                    {
                        type: StatType.Number,
                        value: 7,
                    },
                    {
                        type: StatType.Percent,
                        value: 0,
                    },
                    {
                        type: StatType.Delta,
                        value: 0,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Facebook Messenger',
                    },
                    {
                        type: StatType.Number,
                        value: 1,
                    },
                    {
                        type: StatType.Percent,
                        value: 0,
                    },
                    {
                        type: StatType.Delta,
                        value: 100,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Instagram Direct Message',
                    },
                    {
                        type: StatType.Number,
                        value: 3,
                    },
                    {
                        type: StatType.Percent,
                        value: 0,
                    },
                    {
                        type: StatType.Delta,
                        value: 200,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Instagram Mention',
                    },
                    {
                        type: StatType.Number,
                        value: 5,
                    },
                    {
                        type: StatType.Percent,
                        value: 0,
                    },
                    {
                        type: StatType.Delta,
                        value: 150,
                    },
                ],
            ],
        },
    },
    meta: {
        previous_end_datetime: '2021-12-07T00:00:00+01:00',
        previous_start_datetime: '2021-11-30T00:00:01+01:00',
        end_datetime: '2021-12-13T23:59:59+01:00',
        start_datetime: '2021-12-07T00:00:00+01:00',
    },
}

export const ticketsClosedPerAgentPerDay: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Tickets closed per agent per day',
        legend: {
            axes: {
                x: 'Date',
                y: 'Number of tickets closed',
            },
        },
        data: {
            axes: {
                x: [
                    1638831600, 1638918000, 1639004400, 1639090800, 1639177200,
                    1639263600, 1639350000,
                ],
                y: [],
            },
            lines: [
                {
                    name: 'John D.',
                    data: [25, 21, 20, 24, 0, 0, 11],
                },
                {
                    name: 'Richard F.',
                    data: [23, 30, 23, 16, 0, 0, 30],
                },
                {
                    name: 'Alice Z.',
                    data: [28, 19, 22, 13, 1, 0, 12],
                },
                {
                    name: 'Regina P.',
                    data: [23, 20, 30, 21, 13, 11, 26],
                },
            ],
        },
    },
    meta: {
        end_datetime: '2021-12-13T23:59:59+01:00',
        previous_start_datetime: '2021-11-30T00:00:01+01:00',
        previous_end_datetime: '2021-12-07T00:00:00+01:00',
        start_datetime: '2021-12-07T00:00:00+01:00',
    },
}

export const ticketsClosedPerAgent: Stat<TwoDimensionalChart> = {
    meta: {
        end_datetime: '2021-12-13T23:59:59+01:00',
        previous_end_datetime: '2021-12-07T00:00:00+01:00',
        previous_start_datetime: '2021-11-30T00:00:01+01:00',
        start_datetime: '2021-12-07T00:00:00+01:00',
    },
    data: {
        label: 'Tickets closed per agent',
        data: {
            axes: {
                x: [
                    {
                        name: 'Agent',
                        type: StatType.String,
                    },
                    {
                        name: 'Total',
                        type: StatType.Number,
                    },
                    {
                        name: 'Score',
                        type: StatType.SatisfactionScore,
                    },
                    {
                        name: 'Percentage',
                        type: StatType.Percent,
                    },
                    {
                        name: 'Delta',
                        type: StatType.Delta,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.String,
                        value: 'Unassigned',
                    },
                    {
                        type: StatType.Number,
                        value: 1260,
                    },
                    {
                        type: StatType.SatisfactionScore,
                        value: 4,
                    },
                    {
                        type: StatType.Percent,
                        value: 40,
                    },
                    {
                        type: StatType.Delta,
                        value: 6,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'John D.',
                    },
                    {
                        type: StatType.Number,
                        value: 276,
                    },
                    {
                        type: StatType.SatisfactionScore,
                        value: null,
                    },
                    {
                        type: StatType.Percent,
                        value: 9,
                    },
                    {
                        type: StatType.Delta,
                        value: 0,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Regina P.',
                    },
                    {
                        type: StatType.Number,
                        value: 144,
                    },
                    {
                        type: StatType.SatisfactionScore,
                        value: 3,
                    },
                    {
                        type: StatType.Percent,
                        value: 5,
                    },
                    {
                        type: StatType.Delta,
                        value: 53,
                    },
                ],
            ],
        },
    },
}

export const satisfactionSurveys: Stat<OneDimensionalUnionChart> = {
    data: {
        data: [
            {
                name: 'total_sent',
                type: StatType.Number,
                value: 1176,
                delta: -3,
                more_is_better: true,
            },
            {
                name: 'response_rate',
                type: StatType.Percent,
                value: 8,
                delta: -12,
                more_is_better: true,
            },
            {
                name: 'average_rating',
                type: StatType.Number,
                value: 4.46,
                delta: -2,
                more_is_better: true,
            },
            {
                name: 'response_distribution',
                type: StatType.Percent,
                value: {
                    '1': 7.77,
                    '2': 1.94,
                    '3': 5.83,
                    '4': 5.83,
                    '5': 78.64,
                },
            },
        ],
    },
    meta: {
        previous_end_datetime: '2021-12-07T00:00:00+01:00',
        previous_start_datetime: '2021-11-30T00:00:01+01:00',
        end_datetime: '2021-12-13T23:59:59+01:00',
        start_datetime: '2021-12-07T00:00:00+01:00',
    },
}

export const latestSatisfactionSurveys: Stat<TwoDimensionalChart> = {
    meta: {
        start_datetime: '2021-12-07T00:00:00+01:00',
        previous_end_datetime: '2021-12-07T00:00:00+01:00',
        previous_start_datetime: '2021-11-30T00:00:01+01:00',
        end_datetime: '2021-12-13T23:59:59+01:00',
    },
    data: {
        label: 'Latest Surveys',
        data: {
            axes: {
                x: [
                    {
                        name: 'Customer',
                        type: StatType.CustomerLink,
                    },
                    {
                        name: 'Assignee',
                        type: StatType.String,
                    },
                    {
                        name: 'Date',
                        type: StatType.Date,
                    },
                    {
                        name: 'Score',
                        type: StatType.SatisfactionScore,
                    },
                    {
                        name: 'Comment',
                        type: StatType.SatisfactionSurveyLink,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.CustomerLink,
                        customer_id: 12345,
                        customer_name: null,
                    },
                    {
                        type: StatType.String,
                        value: 'John D.',
                    },
                    {
                        type: StatType.Date,
                        value: '2021-12-13T18:01:52.011646+00:00',
                    },
                    {
                        type: StatType.SatisfactionScore,
                        value: 5,
                    },
                    {
                        type: StatType.SatisfactionSurveyLink,
                        ticket_id: 5243423,
                        comment: '',
                    },
                ],
            ],
        },
    },
}

export const revenueOverview: Stat<OneDimensionalUnionChart> = {
    meta: {
        previous_start_datetime: '2021-12-04T00:00:01+01:00',
        previous_end_datetime: '2021-12-11T00:00:00+01:00',
        start_datetime: '2021-12-11T00:00:00+01:00',
        end_datetime: '2021-12-17T23:59:59+01:00',
    },
    data: {
        data: [
            {
                name: 'tickets_created',
                type: StatType.Number,
                value: 13,
                delta: 8,
                more_is_better: true,
            },
            {
                name: 'tickets_converted',
                type: StatType.Number,
                value: 0,
                delta: 0,
                more_is_better: true,
            },
            {
                name: 'conversion_ratio',
                type: StatType.Percent,
                value: 0,
                delta: 0,
                more_is_better: true,
            },
            {
                name: 'total_sales_from_support',
                type: StatType.Currency,
                value: 0,
                delta: 0,
                more_is_better: true,
                currency: 'USD',
            },
        ],
    },
}

export const revenuePerDay: Stat<TwoDimensionalChart> = {
    meta: {
        previous_start_datetime: '2021-12-04T00:00:01+01:00',
        previous_end_datetime: '2021-12-11T00:00:00+01:00',
        start_datetime: '2021-12-11T00:00:00+01:00',
        end_datetime: '2021-12-17T23:59:59+01:00',
    },
    data: {
        label: 'Sales per day',
        legend: {
            axes: {
                x: 'Creation date',
                y: 'Number of tickets',
            },
        },
        data: {
            axes: {
                x: [
                    1639177200, 1639263600, 1639350000, 1639436400, 1639522800,
                    1639609200, 1639695600,
                ],
                y: [],
            },
            lines: [
                {
                    name: 'Tickets created',
                    data: [2, 0, 7, 0, 3, 1, 0],
                },
                {
                    name: 'Tickets converted',
                    data: [0, 0, 0, 0, 0, 0, 0],
                },
            ],
        },
    },
}

export const revenuePerAgent: Stat<TwoDimensionalChart> = {
    meta: {
        previous_start_datetime: '2021-12-04T00:00:01+01:00',
        previous_end_datetime: '2021-12-11T00:00:00+01:00',
        start_datetime: '2021-12-11T00:00:00+01:00',
        end_datetime: '2021-12-17T23:59:59+01:00',
    },
    data: {
        label: 'Sales per agent',
        data: {
            axes: {
                x: [
                    {
                        type: StatType.String,
                        name: 'Agent',
                    },
                    {
                        type: StatType.Number,
                        name: 'New Tickets Assigned',
                    },
                    {
                        type: StatType.String,
                        name: 'Tickets Converted',
                    },
                    {
                        type: StatType.Percent,
                        name: 'Conversion Ratio',
                    },
                    {
                        type: StatType.Currency,
                        name: 'Sales',
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.String,
                        value: 'Unassigned',
                    },
                    {
                        type: StatType.Number,
                        value: 4,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Percent,
                        value: 0,
                    },
                    {
                        type: StatType.Currency,
                        value: 0,
                        currency: 'USD',
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Acme Support',
                    },
                    {
                        type: StatType.Number,
                        value: 9,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Percent,
                        value: 0,
                    },
                    {
                        type: StatType.Currency,
                        value: 0,
                        currency: 'USD',
                    },
                ],
            ],
        },
    },
}

export const revenuePerTicket: Stat<TwoDimensionalChart> = {
    meta: {
        previous_start_datetime: '2021-12-04T00:00:01+01:00',
        previous_end_datetime: '2021-12-11T00:00:00+01:00',
        start_datetime: '2021-12-11T00:00:00+01:00',
        end_datetime: '2021-12-17T23:59:59+01:00',
    },
    data: {
        label: 'Tickets converted',
        data: {
            axes: {
                x: [
                    {
                        type: StatType.TicketLink,
                        name: 'Ticket',
                    },
                    {
                        type: StatType.Currency,
                        name: 'Sale Value',
                    },
                    {
                        type: StatType.Date,
                        name: 'Sale Date',
                    },
                    {
                        type: StatType.Date,
                        name: 'Ticket Creation Date',
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.TicketLink,
                        ticket_id: 13198875,
                        subject:
                            'New customer message on December 16, 2021 at 1:33 pm',
                    },
                    {
                        type: StatType.Currency,
                        value: 197.94,
                        currency: 'USD',
                    },
                    {
                        type: StatType.Date,
                        value: '2021-12-16T15:56:36+00:00',
                    },
                    {
                        type: StatType.Date,
                        value: '2021-12-16T15:33:44+00:00',
                    },
                ],
            ],
        },
    },
}

export const usersStatuses: Stat<TwoDimensionalChart> = {
    meta: {},
    data: {
        data: {
            axes: {
                x: [
                    {
                        name: 'User',
                        type: StatType.User,
                    },
                    {
                        name: 'Online',
                        type: StatType.Boolean,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.User,
                        value: {
                            name: 'Acme Support',
                            id: 1,
                        },
                    },
                    {
                        type: StatType.Boolean,
                        value: true,
                    },
                ],
                [
                    {
                        type: StatType.User,
                        value: {
                            name: 'John Smith',
                            id: 2,
                        },
                    },
                    {
                        type: StatType.Boolean,
                        value: true,
                    },
                ],
            ],
        },
        label: 'Users statuses',
    },
}

export const openTicketsAssignmentStatuses: Stat<OneDimensionalUnionChart> = {
    meta: {},
    data: {
        data: [
            {
                name: 'Assigned open tickets',
                type: StatType.Number,
                value: 235,
            },
            {
                name: 'Unassigned open tickets',
                type: StatType.Number,
                value: 2700,
            },
        ],
    },
}

export const supportVolumePerHour: Stat<TwoDimensionalChart> = {
    meta: {
        previous_start_datetime: '2022-01-02T00:00:01+01:00',
        start_datetime: '2022-01-03T00:00:00+01:00',
        end_datetime: '2022-01-03T23:59:59+01:00',
        previous_end_datetime: '2022-01-03T00:00:00+01:00',
    },
    data: {
        label: 'Support Volume',
        legend: {
            axes: {
                x: 'Hour of the day',
                y: 'Number of tickets',
            },
        },
        data: {
            axes: {
                x: [
                    1641168000, 1641171600, 1641175200, 1641178800, 1641182400,
                    1641186000, 1641189600, 1641193200, 1641196800, 1641200400,
                    1641204000, 1641207600, 1641211200, 1641214800, 1641218400,
                    1641222000, 1641225600, 1641229200, 1641232800, 1641236400,
                    1641240000, 1641243600, 1641247200, 1641250800,
                ],
                y: [],
            },
            lines: [
                {
                    name: 'created',
                    data: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0,
                        0, 0, 0, 0, 0,
                    ],
                },
                {
                    name: 'replied',
                    data: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0,
                    ],
                },
                {
                    name: 'closed',
                    data: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0,
                    ],
                },
            ],
        },
    },
}

export const userPerformanceOverview: Stat<TwoDimensionalChart> = {
    meta: {
        next_cursor: 'WyJuZXh0IiwgZmFsc2UsICJWaWN0b3IgdGVzdCIsIDM1Mjld',
        previous_end_datetime: '2021-12-27T00:00:00+01:00',
        previous_start_datetime: '2021-12-26T00:00:01+01:00',
        start_datetime: '2021-12-27T00:00:00+01:00',
        end_datetime: '2021-12-27T23:59:59+01:00',
        prev_cursor: null,
    },
    data: {
        data: {
            axes: {
                x: [
                    {
                        name: 'Agent',
                        type: StatType.User,
                    },
                    {
                        name: 'Agent timezone',
                        type: StatType.Timezone,
                    },
                    {
                        name: 'Online',
                        type: StatType.Boolean,
                    },
                    {
                        name: 'Online time',
                        type: StatType.Duration,
                    },
                    {
                        name: 'First Session',
                        type: StatType.Date,
                    },
                    {
                        name: 'Last Session',
                        type: StatType.Date,
                    },
                    {
                        name: 'Tickets closed',
                        type: StatType.Number,
                    },
                    {
                        name: 'Messages sent',
                        type: StatType.Number,
                    },
                    {
                        name: 'Open tickets',
                        type: StatType.Number,
                    },
                    {
                        name: 'Open tickets per channel',
                        type: StatType.Object,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.User,
                        value: {
                            name: 'Acme Support',
                            id: 1,
                        },
                    },
                    {
                        type: StatType.Timezone,
                        value: 'Europe/Paris',
                    },
                    {
                        type: StatType.Boolean,
                        value: true,
                    },
                    {
                        type: StatType.Duration,
                        value: 27762,
                    },
                    {
                        type: StatType.Date,
                        value: '2021-12-27T08:26:30.298890+01:00',
                    },
                    {
                        type: StatType.Date,
                        value: null,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Number,
                        value: 0,
                    },
                    {
                        type: StatType.Number,
                        value: 134,
                    },
                    {
                        type: StatType.Object,
                        value: {
                            aircall: 0,
                            api: 0,
                            chat: 102,
                            email: 26,
                            facebook: 1,
                            'facebook-mention': 0,
                            'facebook-messenger': 2,
                            'facebook-recommendations': 0,
                            'instagram-ad-comment': 0,
                            'instagram-comment': 0,
                            'instagram-mention': 0,
                            'instagram-direct-message': 1,
                            'internal-note': 0,
                            phone: 2,
                            sms: 0,
                            twitter: 0,
                            'twitter-direct-message': 0,
                            'yotpo-review': 0,
                        },
                    },
                ],
            ],
        },
        label: 'Activity of the agents',
    },
}

export const automationOverview: Stat<OneDimensionalUnionChart> = {
    data: {
        data: [
            {
                name: 'overall_automation',
                type: StatType.Percent,
                value: 0,
                delta: 0,
                more_is_better: true,
            },
            {
                name: 'automated_via_rules',
                type: StatType.Percent,
                value: 0,
                delta: 0,
                more_is_better: true,
            },
            {
                name: 'automated_via_selfservice',
                type: StatType.Percent,
                value: 0,
                delta: 0,
                more_is_better: true,
            },
        ],
    },
    meta: {
        end_datetime: '2022-01-04T23:59:59+01:00',
        start_datetime: '2021-12-29T00:00:00+01:00',
        previous_start_datetime: '2021-12-22T00:00:01+01:00',
        previous_end_datetime: '2021-12-29T00:00:00+01:00',
    },
}

export const automationFlow: Stat<SankeyDiagram> = {
    meta: {
        start_datetime: '2021-11-06T00:00:00+01:00',
        previous_start_datetime: '2021-09-07T00:00:01+01:00',
        end_datetime: '2022-01-04T23:59:59+01:00',
        previous_end_datetime: '2021-11-06T00:00:00+01:00',
    },
    data: {
        data: [
            {
                from: 'total',
                to: 'chat',
                flow: 13,
            },
            {
                from: 'chat',
                to: 'not_automated',
                flow: 4,
            },
            {
                from: 'chat',
                to: 'self_service',
                flow: 9,
            },
            {
                from: 'self_service',
                to: 'not_automated',
                flow: 1,
            },
            {
                from: 'self_service',
                to: 'automated',
                flow: 8,
            },
        ],
        legend: {
            labels: {
                total: 'Total',
                email: 'Email',
                phone: 'Phone',
                chat: 'Chat',
                social: 'Social',
                rules: 'Rules',
                self_service: 'Self service',
                not_automated: 'Not automated',
                automated: 'Automated',
            },
            states: [
                'total',
                'email',
                'phone',
                'chat',
                'social',
                'rules',
                'self_service',
                'not_automated',
                'automated',
            ],
        },
        label: 'Customer interaction automation flow',
    },
}

export const automationPerChannel: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Customer interaction automation per channel',
        legend: {
            axes: {
                x: '',
                y: 'Number of tickets',
            },
        },
        data: {
            axes: {
                x: ['chat'],
                y: [],
            },
            lines: [
                {
                    name: 'automated',
                    data: [0],
                },
                {
                    name: 'automated_selfserve',
                    data: [8],
                },
                {
                    name: 'not_automated',
                    data: [5],
                },
            ],
        },
    },
    meta: {
        end_datetime: '2022-01-04T23:59:59+01:00',
        previous_end_datetime: '2021-11-06T00:00:00+01:00',
        start_datetime: '2021-11-06T00:00:00+01:00',
        previous_start_datetime: '2021-09-07T00:00:01+01:00',
    },
}

export const messagesSentPerMacro: Stat<TwoDimensionalChart> = {
    data: {
        label: 'Messages sent per macro',
        data: {
            axes: {
                x: [
                    {
                        name: 'Macro',
                        type: StatType.String,
                    },
                    {
                        name: 'Total',
                        type: StatType.Number,
                    },
                    {
                        name: 'Percentage',
                        type: StatType.Percent,
                    },
                    {
                        name: 'Delta',
                        type: StatType.Delta,
                    },
                ],
            },
            lines: [
                [
                    {
                        type: StatType.String,
                        value: 'Without macro',
                    },
                    {
                        type: StatType.Number,
                        value: 17,
                    },
                    {
                        type: StatType.Percent,
                        value: 94,
                    },
                    {
                        type: StatType.Delta,
                        value: -32,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Hello',
                    },
                    {
                        type: StatType.Number,
                        value: 1,
                    },
                    {
                        type: StatType.Percent,
                        value: 6,
                    },
                    {
                        type: StatType.Delta,
                        value: 100,
                    },
                ],
            ],
        },
    },
    meta: {
        previous_start_datetime: '2021-12-24T00:00:01+01:00',
        start_datetime: '2021-12-31T00:00:00+01:00',
        previous_end_datetime: '2021-12-31T00:00:00+01:00',
        end_datetime: '2022-01-06T23:59:59+01:00',
    },
}
