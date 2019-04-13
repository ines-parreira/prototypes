import {Map} from 'immutable'

export type billingContactType = Map<*, *>

export type creditCardType = {
    expDate: string,
    name: string,
    number: string,
    cvc: string
}
