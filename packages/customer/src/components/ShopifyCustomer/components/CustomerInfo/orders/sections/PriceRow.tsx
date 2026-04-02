import { Box, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

import css from '../sidePanel/OrderSidePanelPreview.less'

type Props = {
    label: string
    amount?: string
    moneySymbol: string
    isBold?: boolean
    isNegative?: boolean
    note?: string
}

export function PriceRow({
    label,
    amount,
    moneySymbol,
    isBold,
    isNegative,
    note,
}: Props) {
    const variant = isBold ? 'bold' : undefined
    const size = isBold ? 'sm' : 'md'

    return (
        <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="baseline"
        >
            <Box flexDirection="row" gap="xxs" flex={1} style={{ minWidth: 0 }}>
                <Text
                    size={size}
                    variant={variant}
                    className={!isBold ? css.label : undefined}
                >
                    {label}
                </Text>
                {note && (
                    <Tooltip
                        trigger={
                            <Text size="md" className={css.refundNote}>
                                {note}
                            </Text>
                        }
                    >
                        <TooltipContent title={note} />
                    </Tooltip>
                )}
            </Box>
            <Text size={size} variant={variant} className={css.priceAmount}>
                {isNegative ? '- ' : ''}
                {moneySymbol}
                {amount}
            </Text>
        </Box>
    )
}
