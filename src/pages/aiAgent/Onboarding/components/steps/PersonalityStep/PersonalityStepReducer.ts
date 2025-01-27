import {DiscountStrategy} from './DiscountStrategy'
import {PersuasionLevel} from './PersuasionLevel'

type ACTIONS =
    | {
          type:
              | 'UPDATE_PERSUASION_LEVEL'
              | 'UPDATE_DISCOUNT_STRATEGY'
              | 'UPDATE_MAX_DISCOUNT_PERCENTAGE'
          value: string
      }
    | {
          type: 'DATA_FETCHED'
          data: {
              persuasionLevel: string
              discountStrategy: string
              maxDiscountPercentage: number
          }
      }

export type State = {
    isLoading: boolean
    persuasionLevel?: {
        value: PersuasionLevel
        error?: string
    }
    discountStrategy?: {
        value: DiscountStrategy
        error?: string
    }
    maxDiscountPercentage?: {
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
                  ...state.maxDiscountPercentage,
                  value: 0,
                  error: undefined,
                  disabled: true,
              }
            : {
                  ...state.maxDiscountPercentage!,
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
            disabled:
                state.discountStrategy?.value === DiscountStrategy.NoDiscount,
            error: isInvalid ? 'Must be a number between 1 and 100' : undefined,
        },
    }
}

const onDataFetched = (
    state: State,
    {
        persuasionLevel,
        discountStrategy,
        maxDiscountPercentage,
    }: {
        persuasionLevel: string
        discountStrategy: string
        maxDiscountPercentage: number
    }
): State => {
    return {
        ...state,
        isLoading: false,
        persuasionLevel: {
            value: PersuasionLevel[
                persuasionLevel as keyof typeof PersuasionLevel
            ],
        },
        discountStrategy: {
            value: DiscountStrategy[
                discountStrategy as keyof typeof DiscountStrategy
            ],
        },
        maxDiscountPercentage: {
            value: maxDiscountPercentage,
            disabled: discountStrategy === DiscountStrategy.NoDiscount,
        },
    }
}

export const reducer = (state: State, action: ACTIONS) => {
    switch (action.type) {
        case 'DATA_FETCHED':
            return onDataFetched(state, action.data)
        case 'UPDATE_PERSUASION_LEVEL':
            return onUpdatePersuasionLevel(state, action.value)
        case 'UPDATE_DISCOUNT_STRATEGY':
            return onUpdateDiscountStrategy(state, action.value)
        case 'UPDATE_MAX_DISCOUNT_PERCENTAGE':
            return onUpdateMaxDiscountPercentage(state, action.value)
        default:
            throw new Error()
    }
}
