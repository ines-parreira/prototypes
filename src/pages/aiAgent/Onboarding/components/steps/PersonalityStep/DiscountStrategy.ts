export enum DiscountStrategy {
    NoDiscount = 'none',
    Minimal = 'rare',
    Balanced = 'balanced',
    Maximized = 'generous',
}

type DiscountStrategyInfo = {
    label: string
    description: string
}
export const DiscountStrategyLabels: Record<
    DiscountStrategy,
    DiscountStrategyInfo
> = {
    [DiscountStrategy.NoDiscount]: {
        label: 'No Discount',
        description:
            'The Sales AI Agent will not offer any discounts under any circumstances.',
    },
    [DiscountStrategy.Minimal]: {
        label: 'Minimal',
        description:
            'The Sales AI Agent will rarely use discounts and only in strategic cases.',
    },
    [DiscountStrategy.Balanced]: {
        label: 'Balanced',
        description:
            'The Sales AI Agent offers discounts at a level optimized for both conversions and profit.',
    },
    [DiscountStrategy.Maximized]: {
        label: 'Maximized',
        description:
            'The Sales AI Agent frequently uses discounts to maximize sales, prioritizing conversions over margins.',
    },
}
export const DiscountStrategySteps = Object.entries(DiscountStrategyLabels).map(
    ([key, {label}]) => ({key, label})
)
