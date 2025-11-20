import type { TwoDimensionalDataItem } from '../../types'
import { toChartData } from './utils'

describe('utils', () => {
    describe('toLineChartData', () => {
        it('should work', () => {
            const data: TwoDimensionalDataItem[] = [
                {
                    label: 'uv',
                    values: [
                        {
                            x: 'Page A',
                            y: 4000,
                        },
                        {
                            x: 'Page B',
                            y: 3000,
                        },
                        {
                            x: 'Page C',
                            y: 2000,
                        },
                        {
                            x: 'Page D',
                            y: 2780,
                        },
                        {
                            x: 'Page E',
                            y: 1890,
                        },
                        {
                            x: 'Page F',
                            y: 2390,
                        },
                        {
                            x: 'Page G',
                            y: 3490,
                        },
                    ],
                },
                {
                    label: 'pv',
                    values: [
                        {
                            x: 'Page A',
                            y: 2400,
                        },
                        {
                            x: 'Page B',
                            y: 1398,
                        },
                        {
                            x: 'Page C',
                            y: 9800,
                        },
                        {
                            x: 'Page D',
                            y: 3909,
                        },
                        {
                            x: 'Page E',
                            y: 4800,
                        },
                        {
                            x: 'Page F',
                            y: 2800,
                        },
                        {
                            x: 'Page G',
                            y: 4300,
                        },
                    ],
                },
            ]

            const result = toChartData(data)
            expect(result).toEqual([
                {
                    name: 'Page A',
                    uv: 4000,
                    pv: 2400,
                },
                {
                    name: 'Page B',
                    uv: 3000,
                    pv: 1398,
                },
                {
                    name: 'Page C',
                    uv: 2000,
                    pv: 9800,
                },
                {
                    name: 'Page D',
                    uv: 2780,
                    pv: 3909,
                },
                {
                    name: 'Page E',
                    uv: 1890,
                    pv: 4800,
                },
                {
                    name: 'Page F',
                    uv: 2390,
                    pv: 2800,
                },
                {
                    name: 'Page G',
                    uv: 3490,
                    pv: 4300,
                },
            ])
        })
    })
})
