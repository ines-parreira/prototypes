import type {CreditCard} from 'models/billing/types'

export function isCardExpired(creditCard: CreditCard): boolean {
    const today = new Date()
    // Set expDate to the first day of the month after the expiration month
    const expDate = new Date(creditCard.exp_year, creditCard.exp_month)
    return today >= expDate
}
