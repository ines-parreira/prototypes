import {NonNullProperties} from './types'

export const filterNonNull = <T extends object>(
    obj: T
): Partial<NonNullProperties<T>> => {
    const result: Partial<NonNullProperties<T>> = {}

    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null) {
            result[key as keyof T] = value
        }
    })

    return result
}

export const convertRateToPercentage = (rate: number) => {
    if (rate > 1 || rate < 0) {
        throw new Error('Ticket sample rate must be between 0 and 1')
    }
    return Math.round(rate * 100)
}

export const convertPercentageToRate = (
    ticketSampleRateInPercentage: number
) => {
    if (!Number.isInteger(ticketSampleRateInPercentage)) {
        throw new Error('Ticket sample rate must be an integer')
    }
    return ticketSampleRateInPercentage / 100
}

export const isAiAgentEnabled = (ticketSampleRate: number) => {
    return ticketSampleRate > 0
}

export const isHandoffEnabled = (silentHandover: boolean) => !silentHandover
