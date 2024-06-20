export const formatAmount = (amount: number, currency?: string | null) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency ?? 'usd',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export const formatNumTickets = (numTickets: number) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numTickets)
}
