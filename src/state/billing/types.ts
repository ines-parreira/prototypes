import {Map} from 'immutable'

export type BillingContact = Map<any, any>

export type CreditCard = {
    expDate: string
    name: string
    number: string
    cvc: string
}
