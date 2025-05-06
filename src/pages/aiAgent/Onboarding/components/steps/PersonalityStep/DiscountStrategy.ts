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
            'Sell at full price, focusing on value. Offering discounts boosts conversion by ~50%.',
    },
    [DiscountStrategy.Minimal]: {
        label: 'Conservative',
        description:
            'Offer discounts only in rare cases, such as when a high-intent customer hesitates at checkout.',
    },
    [DiscountStrategy.Balanced]: {
        label: 'Strategic',
        description:
            'Use discounts selectively based on customer behavior and likelihood to convert.',
    },
    [DiscountStrategy.Maximized]: {
        label: 'Generous',
        description:
            'Use discounts often to maximize conversions and reduce cart abandonment.',
    },
}
export const DiscountStrategySteps = Object.entries(DiscountStrategyLabels).map(
    ([key, { label }]) => ({ key, label }),
)
