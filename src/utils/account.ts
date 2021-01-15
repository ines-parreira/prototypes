import moment from 'moment'

export const isAccountCreatedBeforeFeatureBasedPlans = (created_at: string) => {
    return moment(created_at).isBefore(moment('2021-02-01'))
}
