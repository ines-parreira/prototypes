import { Box, Icon, Skeleton } from '@gorgias/axiom'

import { getReferenceVisual } from '../../icons'
import { ReferenceCardSkeletonFrame } from '../shared/ReferenceCardSkeletonFrame'

import css from '../shared/ReferenceCardShell.less'

const VISUAL = getReferenceVisual('support-action')

export function SupportActionReferenceCardSkeleton() {
    return (
        <ReferenceCardSkeletonFrame icon={VISUAL.icon} typeLabel={VISUAL.label}>
            <Box
                flexDirection="row"
                alignItems="center"
                gap="xxs"
                className={css.titleRow}
            >
                <Skeleton height={14} width="55%" />
                <Skeleton height={20} width={48} />
            </Box>

            <Box flexDirection="column" gap="xxs" className={css.rows}>
                <Box flexDirection="row" alignItems="center" gap="xxs">
                    <Icon
                        name="clock"
                        size="xs"
                        color="content-neutral-secondary"
                    />
                    <Skeleton height={10} width={120} />
                </Box>
            </Box>
        </ReferenceCardSkeletonFrame>
    )
}
