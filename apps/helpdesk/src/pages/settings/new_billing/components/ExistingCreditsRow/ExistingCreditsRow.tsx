import { formatAmount } from '@repo/billing'

import { Box, Button, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

type ExistingCreditsRowProps = {
    existingCredits: number
    currency: string
}

export function ExistingCreditsRow({
    existingCredits,
    currency,
}: ExistingCreditsRowProps) {
    return (
        <Box justifyContent="space-between" alignItems="center" gap="sm">
            <Box alignItems="center">
                <Text>Existing credits</Text>
                <Tooltip
                    delay={0}
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="info"
                            aria-label="About existing credits"
                            excludeFromTabOrder
                        />
                    }
                >
                    <TooltipContent title="These credits will be applied to your balance due." />
                </Tooltip>
            </Box>
            <Text>
                {formatAmount(Math.round(existingCredits) / 100, currency)}
            </Text>
        </Box>
    )
}
