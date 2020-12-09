export enum PlanInterval {
    'Month' = 'month',
}

export type Plan = {
    cost_per_ticket: number
    interval: PlanInterval
    public: boolean
    name: string
    trial_period_days: number
    order: number
    currency: string
    free_tickets: number
    limits: {
        default: number
        max: number
        min: number
    }
    amount: number
    integrations: number
}
