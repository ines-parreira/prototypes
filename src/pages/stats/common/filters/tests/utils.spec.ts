import {
    getScoreLabelByValue,
    getScoreLabelsAndValues,
} from 'pages/stats/common/filters/utils'

describe('utils', () => {
    describe('getScoreLabelsAndValues', () => {
        it('should return array of score labels and values in ascending order', () => {
            const result = getScoreLabelsAndValues(3, false)
            expect(result).toEqual([
                {
                    value: '1',
                    label: '★☆☆',
                },
                {
                    value: '2',
                    label: '★★☆',
                },
                {
                    value: '3',
                    label: '★★★',
                },
            ])
        })
        it('should return array of score labels and values in descending order', () => {
            const result = getScoreLabelsAndValues(5, true)
            expect(result).toEqual([
                {
                    value: '5',
                    label: '★★★★★',
                },
                {
                    value: '4',
                    label: '★★★★☆',
                },
                {
                    value: '3',
                    label: '★★★☆☆',
                },
                {
                    value: '2',
                    label: '★★☆☆☆',
                },
                {
                    value: '1',
                    label: '★☆☆☆☆',
                },
            ])
        })
    })

    describe('getScoreLabelByValue', () => {
        it('should return a label for a given score value', () => {
            expect(getScoreLabelByValue(1, 3)).toEqual('★☆☆')
            expect(getScoreLabelByValue(2, 3)).toEqual('★★☆')
            expect(getScoreLabelByValue(3, 3)).toEqual('★★★')
        })
    })
})
