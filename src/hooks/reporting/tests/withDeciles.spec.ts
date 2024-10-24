import {forEach} from 'lodash'

import {
    DataResponse,
    getDecilesIndex,
    selectWithDeciles,
    withDeciles,
} from 'hooks/reporting/withDeciles'

const deciles = Array.from(Array(10).keys())

describe('withDeciles', () => {
    const results = Array.from(Array(100).keys()).map((value) => ({
        field: value,
    }))
    const response: DataResponse = {
        data: {
            data: results,
        },
    }

    describe('withDeciles', () => {
        it('should replace the response data with data with deciles', () => {
            const responseWithDeciles = withDeciles(response)

            expect(responseWithDeciles.data.data).toEqual(
                selectWithDeciles(results)
            )
        })
    })

    describe('selectWithDeciles', () => {
        it('should add decile field to ordered results', () => {
            const resultsWithDeciles = selectWithDeciles(results)

            forEach(deciles, (decile) => {
                const resultsPerDecile = resultsWithDeciles.filter(
                    (result) => result.decile === decile
                ).length
                expect(resultsPerDecile).toEqual(
                    results.length / deciles.length
                )
            })
        })

        it('should return deciles even for less then ten results', () => {
            const limitedResults = Array.from(Array(5).keys()).map((value) => ({
                field: value,
            }))
            const smallerThenDecilesBuckets = getDecilesIndex(
                limitedResults.length
            )

            const resultsWithDeciles = selectWithDeciles(limitedResults)

            expect(limitedResults.length).toBeLessThan(10)
            forEach(smallerThenDecilesBuckets, (decile) => {
                const resultsPerDecile = resultsWithDeciles.filter(
                    (result) => result.decile === decile.decile
                ).length
                expect(resultsPerDecile).toEqual(1)
            })
        })

        const decilePerIndex = (decile: number, decileIndex: number) => ({
            decile,
            decileIndex,
        })

        it.each([
            {
                results: 0,
                deciles: [],
            },
            {
                results: 1,
                deciles: [9].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 2,
                deciles: [9, 4].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 3,
                deciles: [9, 6, 2].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 4,
                deciles: [9, 7, 4, 2].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 5,
                deciles: [9, 7, 5, 3, 1].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 6,
                deciles: [9, 7, 6, 4, 2, 1].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 7,
                deciles: [9, 8, 6, 5, 3, 2, 0].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 8,
                deciles: [9, 8, 7, 5, 4, 3, 2, 0].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 9,
                deciles: [9, 8, 7, 6, 5, 3, 2, 1, 0].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 10,
                deciles: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((decile, index) =>
                    decilePerIndex(decile, index)
                ),
            },
            {
                results: 100,
                deciles: [90, 80, 70, 60, 50, 40, 30, 20, 10, 0]
                    .map((decile, index) => decilePerIndex(index, decile))
                    .reverse(),
            },
        ])('$results $deciles', ({results, deciles}) => {
            expect(getDecilesIndex(results)).toEqual(deciles)
        })
    })
})
