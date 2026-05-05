import { Box, Skeleton } from '@gorgias/axiom'

const FIELD_ROW_GRID = 'minmax(80px, 0.8fr) minmax(140px, 1.2fr)'
const FIELD_ROW_HEIGHT = 24

type Props = {
    labelWidth?: string | number
    valueWidth?: string | number
}

export function InfobarCustomerFieldRowSkeleton({
    labelWidth = '60%',
    valueWidth = '80%',
}: Props = {}) {
    return (
        <Box
            display="grid"
            w="100%"
            alignItems="center"
            style={{
                gridTemplateColumns: FIELD_ROW_GRID,
                height: FIELD_ROW_HEIGHT,
            }}
        >
            <Skeleton width={labelWidth} height={14} />
            <Skeleton width={valueWidth} height={14} />
        </Box>
    )
}
