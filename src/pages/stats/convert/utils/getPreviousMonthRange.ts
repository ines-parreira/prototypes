import moment from 'moment-timezone'

export const getPreviousMonthRange = () => {
    const currentDate = moment(new Date()).subtract(1, 'months')

    return [
        currentDate.startOf('month').toISOString(),
        currentDate.endOf('month').toISOString(),
    ]
}
