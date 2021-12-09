import {
    OneDimensionalChart,
    Stat,
    StatType,
    TwoDimensionalChart,
} from '../models/stat/types'

export const firstResponseTimeStat: Stat<TwoDimensionalChart> = {
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
