import { Box, Card, Skeleton } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { ArticleTypeBadge } from './ArticleTypeBadge'

type Props = {
    icon: IconName
    typeLabel: string
    /** Reserve space for the content body preview (Guidance only). */
    hasBody?: boolean
}

/**
 * Loading state for {@link ArticleReferenceCard}. The type badge is known
 * before the article resolves, so it renders for real; everything data-driven
 * is replaced with skeletons that mirror the loaded layout's geometry.
 */
export function ArticleReferenceCardSkeleton({
    icon,
    typeLabel,
    hasBody = false,
}: Props) {
    return (
        <Card
            flexDirection="column"
            gap="md"
            elevation="mid"
            p="md"
            width="100%"
        >
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="xs"
            >
                <ArticleTypeBadge icon={icon} label={typeLabel} />
                <Skeleton height={24} width={88} />
            </Box>

            <Skeleton height={16} width="70%" />

            {hasBody ? <Skeleton height={28} width="100%" /> : null}

            <Box flexDirection="column" gap="xs">
                <Skeleton height={12} width={48} />
                <Box flexDirection="row" gap="xs">
                    <Skeleton height={24} width={128} />
                    <Skeleton height={24} width={112} />
                </Box>
            </Box>

            <Skeleton height={12} width={96} />
        </Card>
    )
}
