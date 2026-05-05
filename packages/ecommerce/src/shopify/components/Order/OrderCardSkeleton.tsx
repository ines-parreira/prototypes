import {
    Box,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    Skeleton,
} from '@gorgias/axiom'

import css from './OrderCard.less'

export function OrderCardSkeleton() {
    return (
        <Card className={css.orderCard} gap="xxxs">
            <CardHeader
                leadingSlot={<Skeleton circle width={20} height={20} />}
                title={
                    <Box
                        justifyContent="space-between"
                        alignItems="center"
                        flex="1"
                        minWidth={0}
                        gap="xxxs"
                    >
                        <Skeleton width={52} height={14} />
                        <Skeleton width={58} height={12} />
                    </Box>
                }
            />
            <CardContent>
                <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="xs"
                    paddingBottom="xxxxs"
                    paddingTop="xxxxs"
                >
                    <Skeleton width={32} height={32} borderRadius={4} />
                    <Skeleton width={40} height={12} />
                    <Skeleton width={48} height={12} />
                </Box>
            </CardContent>
            <CardFooter>
                <Box flexDirection="row" gap="xs">
                    <Skeleton width={68} height={20} borderRadius={6} />
                    <Skeleton width={62} height={20} borderRadius={6} />
                    <Skeleton width={74} height={20} borderRadius={6} />
                </Box>
            </CardFooter>
        </Card>
    )
}
