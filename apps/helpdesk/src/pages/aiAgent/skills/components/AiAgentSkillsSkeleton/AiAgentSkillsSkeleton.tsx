import { Box, Skeleton } from '@gorgias/axiom'

import css from './AiAgentSkillsSkeleton.less'

export const AiAgentSkillsSkeleton = () => (
    <Box flexDirection="column" className={css.container}>
        <Skeleton width="100%" height={200} />
        <Box aria-label="Loading recommended skills" className={css.section}>
            <Box flexDirection="column" gap="xxxs">
                <Skeleton width={200} height={24} />
                <Skeleton width={360} height={20} />
            </Box>
            <Box gap="md" overflow="hidden">
                <Skeleton width={412} height={156} />
                <Skeleton width={412} height={156} />
                <Skeleton width={412} height={156} />
            </Box>
        </Box>
    </Box>
)
