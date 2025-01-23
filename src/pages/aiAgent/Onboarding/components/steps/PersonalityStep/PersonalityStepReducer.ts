import {DiscountStrategy} from './DiscountStrategy'
import {PersuasionLevel} from './PersuasionLevel'

export type ACTION_TYPE = {
    type:
        | 'UPDATE_PERSUASION_LEVEL'
        | 'UPDATE_DISCOUNT_STRATEGY'
        | 'UPDATE_MAX_DISCOUNT_PERCENTAGE'
    value: string
}
export type State = {
    persuasionLevel: {
        value: PersuasionLevel
        error?: string
    }
    discountStrategy: {
        value: DiscountStrategy
        error?: string
    }
    maxDiscountPercentage: {
        value: number
        disabled: boolean
        error?: string
    }
}

const onUpdatePersuasionLevel = (state: State, value: string): State => {
    const persuasionLevel =
        PersuasionLevel[value as keyof typeof PersuasionLevel]
    return {
        ...state,
        persuasionLevel: {
            value: persuasionLevel,
        },
    }
}

const onUpdateDiscountStrategy = (state: State, value: string): State => {
    const discountStrategy =
        DiscountStrategy[value as keyof typeof DiscountStrategy]
    const maxDiscountPercentage: State['maxDiscountPercentage'] =
        discountStrategy === DiscountStrategy.NoDiscount
            ? {
                  value: 0,
                  error: undefined,
                  disabled: true,
              }
            : {
                  ...state.maxDiscountPercentage,
                  disabled: false,
              }
    return {
        ...state,
        discountStrategy: {
            value: discountStrategy,
        },
        maxDiscountPercentage,
    }
}

const MIN_PERCENTAGE_DISCOUNT = 1
const MAX_PERCENTAGE_DISCOUNT = 100
const onUpdateMaxDiscountPercentage = (
    state: State,
    valueAsString: string
): State => {
    const value = Number.parseInt(valueAsString, 10)
    const isInvalid =
        Number.isNaN(value) ||
        value < MIN_PERCENTAGE_DISCOUNT ||
        value > MAX_PERCENTAGE_DISCOUNT

    return {
        ...state,
        maxDiscountPercentage: {
            ...state.maxDiscountPercentage,
            value: value,
            error: isInvalid ? 'Must be a number between 1 and 100' : undefined,
        },
    }
}

export const reducer = (state: State, {type, value}: ACTION_TYPE) => {
    switch (type) {
        case 'UPDATE_PERSUASION_LEVEL':
            return onUpdatePersuasionLevel(state, value)
        case 'UPDATE_DISCOUNT_STRATEGY':
            return onUpdateDiscountStrategy(state, value)
        case 'UPDATE_MAX_DISCOUNT_PERCENTAGE':
            return onUpdateMaxDiscountPercentage(state, value)
        default:
            throw new Error()
    }
}
