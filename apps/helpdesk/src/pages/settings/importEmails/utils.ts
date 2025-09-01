import moment from 'moment'

export const getStartEndDate = (
    importWindowStart: string,
    importWindowEnd: string,
) => {
    const startDate = moment(importWindowStart).format('MMM D, YYYY')
    const endDate = moment(importWindowEnd).format('MMM D, YYYY')

    return {
        startDate,
        endDate,
    }
}
