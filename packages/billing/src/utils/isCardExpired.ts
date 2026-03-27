type CardExpiration = {
    exp_month: number
    exp_year: number
}

export function isCardExpired(creditCard: CardExpiration): boolean {
    const today = new Date()
    const expDate = new Date(creditCard.exp_year, creditCard.exp_month)
    return today >= expDate
}
