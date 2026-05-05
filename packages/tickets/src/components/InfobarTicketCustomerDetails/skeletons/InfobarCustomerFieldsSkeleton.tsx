import { Box } from '@gorgias/axiom'

import { InfobarCustomerFieldRowSkeleton } from './InfobarCustomerFieldRowSkeleton'

const FIELD_ROW_WIDTHS: Array<{
    labelWidth: string | number
    valueWidth: string | number
}> = [
    { labelWidth: 95, valueWidth: 70 },
    { labelWidth: 65, valueWidth: 50 },
    { labelWidth: 40, valueWidth: '85%' },
    { labelWidth: 50, valueWidth: '70%' },
    { labelWidth: 55, valueWidth: '60%' },
]

export function InfobarCustomerFieldsSkeleton() {
    return (
        <Box
            flexDirection="column"
            gap="xxxs"
            paddingLeft="md"
            paddingRight="md"
        >
            {FIELD_ROW_WIDTHS.map((widths, index) => (
                <InfobarCustomerFieldRowSkeleton
                    key={index}
                    labelWidth={widths.labelWidth}
                    valueWidth={widths.valueWidth}
                />
            ))}
        </Box>
    )
}
