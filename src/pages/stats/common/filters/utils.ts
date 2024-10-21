import times from 'lodash/times'

export const getScoreLabelsAndValues = (
    maxScoreNumber: number,
    isDescending: boolean
) => {
    const labelsAndValues = times(maxScoreNumber, (index) => {
        const idx = index + 1
        const scoreValue = isDescending ? maxScoreNumber - idx + 1 : idx
        return {
            value: scoreValue.toString(),
            label:
                Array(scoreValue).fill('★').join('') +
                Array(maxScoreNumber - scoreValue)
                    .fill('☆')
                    .join(''),
        }
    })
    return labelsAndValues
}

export const getScoreLabelByValue = (
    scoreValue: number,
    maxScoreNumber: number
) => {
    return (
        Array(scoreValue).fill('★').join('') +
        Array(maxScoreNumber - scoreValue)
            .fill('☆')
            .join('')
    )
}
