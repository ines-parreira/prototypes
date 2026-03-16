import {
    Box,
    Card,
    Elevation,
    Heading,
    Skeleton,
    Tag,
    Text,
    ToggleField,
} from '@gorgias/axiom'

import css from './ArticleRecommendationCard.less'

type ArticleRecommendationCardProps = {
    isEnabled: boolean
    isDisabled?: boolean
    isLoading?: boolean
    showHelpCenterRequired?: boolean
    onChange: (value: boolean) => void
}

export function ArticleRecommendationCard({
    isEnabled,
    isDisabled = false,
    isLoading = false,
    showHelpCenterRequired = false,
    onChange,
}: ArticleRecommendationCardProps) {
    if (isLoading) {
        return <Skeleton height={140} />
    }

    return (
        <Card elevation={Elevation.Mid} p="md" className={css.card}>
            <Box flexDirection="column" gap="xs">
                <Box justifyContent="space-between" alignItems="center">
                    <Heading size="md">Article recommendations</Heading>
                    <Box alignItems="center" gap="xs">
                        {showHelpCenterRequired && (
                            <Tag color="blue" size="md">
                                Help center required
                            </Tag>
                        )}
                        <ToggleField
                            value={isEnabled}
                            onChange={onChange}
                            isDisabled={isDisabled}
                        />
                    </Box>
                </Box>
                <Text
                    size="md"
                    className={css.description}
                    color="content-neutral-secondary"
                >
                    Automatically send a Help Center article in response to
                    customer questions in Chat, if a relevant article exists. If
                    a customer requests more help, a ticket will be created for
                    an agent to handle.
                </Text>
            </Box>
        </Card>
    )
}
