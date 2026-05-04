import { formatAmount } from '@repo/billing'

import { Box, Text } from '@gorgias/axiom'

type DiscountSummaryRowProps = {
    discountAmountInCents: number
    cadence: string
    currency: string
}

export function DiscountSummaryRow({
    discountAmountInCents,
    cadence,
    currency,
}: DiscountSummaryRowProps) {
    return (
        <Box justifyContent="space-between">
            <Text>Discount</Text>
            <Text>{`${formatAmount(-Math.round(discountAmountInCents) / 100, currency)}/${cadence}`}</Text>
        </Box>
    )
}
