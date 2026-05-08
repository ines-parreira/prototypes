import { Box, Icon, Text } from '@gorgias/axiom'

import css from './SkillWizardIntro.less'

type Props = {
    reviewableCount: number
    totalCount: number
}

export const SkillWizardIntro = ({ reviewableCount, totalCount }: Props) => {
    const allReviewable = reviewableCount > 0 && reviewableCount === totalCount

    const heading = allReviewable
        ? 'All of your skills are ready to enable'
        : `Good news: ${reviewableCount} of your skills are ready to enable`

    return (
        <Box
            role="status"
            alignItems="center"
            justifyContent="center"
            className={css.container}
        >
            <Box
                flexDirection="column"
                alignItems="center"
                gap="xs"
                className={css.copy}
            >
                <Box
                    alignItems="center"
                    justifyContent="center"
                    className={css.iconWrapper}
                >
                    <Icon name="ai-alt-1" size="sm" color="white" />
                </Box>
                <Box flexDirection="column" gap="xxxs" alignItems="center">
                    <Text size="md" variant="bold">
                        {heading}
                    </Text>
                    <Text size="sm" color="var(--content-neutral-secondary)">
                        Give them a quick review first
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}
