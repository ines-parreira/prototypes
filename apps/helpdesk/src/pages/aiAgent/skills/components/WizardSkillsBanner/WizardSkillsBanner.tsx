import { Box, Card, Heading, Icon, Tag, TagColor, Text } from '@gorgias/axiom'

import css from './WizardSkillsBanner.less'

export const WizardSkillsBanner = () => (
    <Card
        width="100%"
        display="flex"
        flexDirection="row"
        padding="lg"
        gap="xxl"
        className={css.banner}
    >
        <Box flex={1} flexDirection="column" gap="xs" minWidth={0}>
            <Box>
                <Tag color={TagColor.Purple}>New</Tag>
            </Box>
            <Heading size="xl">
                Skills: more consistent answers for your most common
                conversations
            </Heading>
            <Text>
                We built skills from some of your existing guidance. With
                skills, AI Agent will now follow specific instructions every
                time it detects a matching intent. The rest of your guidance
                stays active to answer everything skills don&apos;t cover.
            </Text>
        </Box>
        <Box
            width={288}
            height={162}
            alignItems="center"
            justifyContent="center"
            className={css.placeholder}
        >
            <Icon name="media-play-circle" size="lg" />
        </Box>
    </Card>
)
