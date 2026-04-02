export enum FinancialStatus {
    Pending = 'pending',
    Authorized = 'authorized',
    PartiallyPaid = 'partially_paid',
    Paid = 'paid',
    PartiallyRefunded = 'partially_refunded',
    Refunded = 'refunded',
    Voided = 'voided',
    Expired = 'expired',
}

export enum FulfillmentStatus {
    Fulfilled = 'fulfilled',
    Partial = 'partial',
    Restocked = 'restocked',
    InProgress = 'in_progress',
    OnHold = 'on_hold',
    Open = 'open',
    PartiallyFulfilled = 'partially_fulfilled',
    PendingFulfillment = 'pending_fulfillment',
    Scheduled = 'scheduled',
    Unfulfilled = 'unfulfilled',
}
