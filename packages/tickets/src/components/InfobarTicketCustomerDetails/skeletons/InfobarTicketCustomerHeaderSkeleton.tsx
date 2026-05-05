import { Box, Skeleton } from '@gorgias/axiom'

const AVATAR_SIZE = 32

export function InfobarTicketCustomerHeaderSkeleton() {
    return (
        <Box alignItems="center" gap="xxs" paddingLeft="md" paddingRight="md">
            <Skeleton
                width={AVATAR_SIZE}
                height={AVATAR_SIZE}
                style={{ borderRadius: '50%' }}
            />
            <Skeleton width={140} height={16} />
        </Box>
    )
}
