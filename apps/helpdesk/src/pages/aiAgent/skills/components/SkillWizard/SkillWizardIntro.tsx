import { Box, Icon, Text } from '@gorgias/axiom'

import { useTypewriter } from './useTypewriter'

import css from './SkillWizardIntro.less'

type Props = {
    reviewableCount: number
    totalCount: number
}

const SUBTITLE = 'Give them a quick review first'

export const SkillWizardIntro = ({ reviewableCount, totalCount }: Props) => {
    const allReviewable = reviewableCount > 0 && reviewableCount === totalCount

    const heading = allReviewable
        ? 'All of your skills are ready to enable'
        : `Good news: ${reviewableCount} of your skills are ready to enable`

    const { typed: typedHeading, isComplete: headingDone } = useTypewriter(
        heading,
        { delayMs: 30 },
    )
    const { typed: typedSubtitle, isComplete: subtitleDone } = useTypewriter(
        SUBTITLE,
        { delayMs: 30, enabled: headingDone },
    )

    const isHeadingTyping = !headingDone
    const isSubtitleTyping = headingDone && !subtitleDone

    return (
        <Box
            role="status"
            aria-label={`${heading}. ${SUBTITLE}`}
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
                        {typedHeading}
                        {isHeadingTyping && (
                            <span className={css.caret} aria-hidden="true" />
                        )}
                    </Text>
                    <Text size="sm" color="var(--content-neutral-secondary)">
                        {typedSubtitle}
                        {isSubtitleTyping && (
                            <span className={css.caret} aria-hidden="true" />
                        )}
                    </Text>
                </Box>
            </Box>
        </Box>
    )
}
