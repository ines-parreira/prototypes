export enum FinancialStatus {
    Pending = 'pending',
    Authorized = 'authorized',
    PartiallyPaid = 'partially_paid',
    Paid = 'paid',
    PartiallyRefunded = 'partially_refunded',
    Refunded = 'refunded',
    Voided = 'voided',
}

export enum FulfillmentStatus {
    Fulfilled = 'fulfilled',
    Partial = 'partial',
    Restocked = 'restocked',
}
