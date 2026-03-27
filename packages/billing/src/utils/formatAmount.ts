export const formatAmount = (amount: number, currency?: string | null) => {
    const numDigits = Number.isInteger(amount) ? 0 : 2

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency ?? 'usd',
        minimumFractionDigits: numDigits,
        maximumFractionDigits: numDigits,
    }).format(amount)
}

export const formatNumTickets = (numTickets: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numTickets)
}
