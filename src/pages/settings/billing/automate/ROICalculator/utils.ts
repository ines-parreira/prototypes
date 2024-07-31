import {AutomatePlan} from 'models/billing/types'
import {getPlanPrice} from 'models/billing/utils'

export const convertSecondsToHours = (
    seconds?: string | number | null
): string => {
    if (!seconds) {
        return '0'
    }

    const secondsNumber = Number(seconds) || 0

    const hours = secondsNumber / 3600
    return (Math.round(hours * 10) / 10).toString()
}

export const convertSecondsToMinutes = (
    seconds?: string | number | null
): string => {
    if (!seconds) {
        return '0'
    }

    const secondsNumber = Number(seconds) || 0

    const minutes = secondsNumber / 60
    return (Math.round(minutes * 10) / 10).toString()
}

export const formatValue = (val: string) => {
    const inputString = val.replace(/[^0-9.]/g, '')
    const inputNumber = Number(inputString)

    const decimalCount = inputString.split('.')[1]?.length || 0

    const hasDecimalTail = val.slice(-1) === '.'

    const costValue = val
        ? inputNumber.toLocaleString(undefined, {
              minimumFractionDigits: decimalCount
                  ? Math.min(decimalCount, 2)
                  : 0,
              maximumFractionDigits: 2,
          }) + (hasDecimalTail ? '.' : '')
        : ''

    return costValue
}

export const formatOnFocus = (
    setValue: (val: string | number) => void,
    val: string | number
) => {
    setValue(Number(val.toString().replace(/[^0-9.]/g, '')) || '')
}
export const formatOnBlur = (
    setValue: (val: string | number) => void,
    val: string | number,
    timeUnit: string
) => {
    setValue(
        `${Number(val.toString().replace(/[^0-9.]/g, '')) || 0}${timeUnit}`
    )
}

export const getResolutionTimeWithAutomate = (val: string | number) => {
    const resolutionTime = Number(val.toString().replace(/[^0-9.]/g, '')) || 0
    const resolutionTimeWithAutomate = resolutionTime * 0.7

    return Math.round(resolutionTimeWithAutomate * 10) / 10 || '(X)'
}

export const getFirstResponseTimeWithAutomate = (val: string | number) => {
    const firstResponseTime =
        Number(val.toString().replace(/[^0-9.]/g, '')) || 0
    const firstResponseTimeWithAutomate = firstResponseTime * 0.7
    return Math.round(firstResponseTimeWithAutomate * 10) / 10 || '(X)'
}

export const getAutomateSubscriptionPrice = (
    automatePlans: AutomatePlan[],
    numberOfClosedTickets: number
) => {
    const numQuota = numberOfClosedTickets * 0.3
    const sortedPlans = automatePlans.sort(
        (a, b) => (a?.num_quota_tickets || 0) - (b?.num_quota_tickets || 0)
    )
    const firstPlanWithHigherQuota = sortedPlans.find(
        (plan) =>
            plan?.num_quota_tickets !== null &&
            plan?.num_quota_tickets > numQuota
    )

    return getPlanPrice(firstPlanWithHigherQuota)
}
