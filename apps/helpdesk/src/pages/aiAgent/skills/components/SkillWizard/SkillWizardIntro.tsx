import { AIThinking, Box, Text } from '@gorgias/axiom'

import css from './SkillWizardIntro.less'

type Props = {
    reviewableCount: number
    totalCount: number
}

export const SkillWizardIntro = ({ reviewableCount, totalCount }: Props) => {
    const allReviewable = reviewableCount > 0 && reviewableCount === totalCount

    const subtitle = allReviewable
        ? 'They’re all ready to enable, give them a quick look first'
        : `${reviewableCount} of your skills are ready to enable, give them a quick look first`

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
                <AIThinking variant="animated" />
                <Box flexDirection="column" gap="xxxs" alignItems="center">
                    <Text size="md" variant="bold">
                        Preparing your skills for review
                    </Text>
                    <Text size="sm" color="var(--content-neutral-secondary)">
                        {subtitle}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}
