import { StatType } from 'domains/reporting/models/stat/types'
import type {
    Stat,
    TwoDimensionalChart,
} from 'domains/reporting/models/stat/types'
import { userPerformanceOverview } from 'fixtures/stats'

export const statsWithInvalidUserIds: Stat<TwoDimensionalChart> = {
    ...userPerformanceOverview,
    data: {
        ...userPerformanceOverview.data,
        data: {
            ...userPerformanceOverview.data.data,
            lines: [
                [
                    {
                        type: StatType.User,
                        value: { name: 'Valid User', id: 1 },
                    },
                ],
                [
                    {
                        type: StatType.User,
                        value: { name: 'Invalid User - Zero', id: 0 },
                    },
                ],
                [
                    {
                        type: StatType.User,
                        value: { name: 'Invalid User - Negative', id: -1 },
                    },
                ],
                [
                    {
                        type: StatType.User,
                        value: { name: 'Another Valid User', id: 2 },
                    },
                ],
            ],
        },
    },
}

export const statsWithNoUserCells: Stat<TwoDimensionalChart> = {
    ...userPerformanceOverview,
    data: {
        ...userPerformanceOverview.data,
        data: {
            ...userPerformanceOverview.data.data,
            lines: [
                [
                    {
                        type: StatType.User,
                        value: { name: 'Valid User', id: 1 },
                    },
                ],
                [
                    {
                        type: StatType.Number,
                        value: 123,
                    },
                ],
                [
                    {
                        type: StatType.String,
                        value: 'Not a user',
                    },
                ],
            ],
        },
    },
}

export const statsWithEmptyCells: Stat<TwoDimensionalChart> = {
    ...userPerformanceOverview,
    data: {
        ...userPerformanceOverview.data,
        data: {
            ...userPerformanceOverview.data.data,
            lines: [
                [
                    {
                        type: StatType.User,
                        value: { name: 'Valid User', id: 1 },
                    },
                ],
                [],
                [
                    {
                        type: StatType.User,
                        value: { name: 'Another Valid User', id: 2 },
                    },
                ],
            ],
        },
    },
}

export const statsWithNullOrUndefinedCells: Stat<TwoDimensionalChart> = {
    ...userPerformanceOverview,
    data: {
        ...userPerformanceOverview.data,
        data: {
            ...userPerformanceOverview.data.data,
            lines: [
                [
                    {
                        type: StatType.User,
                        value: { name: 'Valid User', id: 1 },
                    },
                ],
                [null],
                [undefined],
                [
                    {
                        type: StatType.User,
                        value: { name: 'Another Valid User', id: 2 },
                    },
                ],
            ],
        },
    },
} as unknown as Stat<TwoDimensionalChart>
