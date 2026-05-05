import { Box } from '@gorgias/axiom'

import { CustomerInfoFieldRowSkeleton } from './CustomerInfoFieldRowSkeleton'

const FIELD_ROW_WIDTHS: Array<{
    labelWidth: string | number
    valueWidth: string | number
}> = [
    { labelWidth: 75, valueWidth: 95 },
    { labelWidth: 50, valueWidth: 60 },
    { labelWidth: 40, valueWidth: '90%' },
    { labelWidth: 70, valueWidth: 85 },
    { labelWidth: 55, valueWidth: '70%' },
    { labelWidth: 45, valueWidth: 80 },
]

export function CustomerDetailsBodySkeleton() {
    return (
        <Box flexDirection="column" gap="xxs">
            {FIELD_ROW_WIDTHS.map((widths, index) => (
                <CustomerInfoFieldRowSkeleton
                    key={index}
                    labelWidth={widths.labelWidth}
                    valueWidth={widths.valueWidth}
                />
            ))}
        </Box>
    )
}
