import { formatAmount } from '@repo/billing'

import { Box, Text } from '@gorgias/axiom'

type DiscountSummaryRowProps = {
    discountAmountInCents: number
    invoiceCadence: string
    currency: string
}

export function DiscountSummaryRow({
    discountAmountInCents,
    invoiceCadence,
    currency,
}: DiscountSummaryRowProps) {
    return (
        <Box justifyContent="space-between">
            <Text>Discount</Text>
            <Text>{`${formatAmount(-Math.round(discountAmountInCents) / 100, currency)}/${invoiceCadence}`}</Text>
        </Box>
    )
}
