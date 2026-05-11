import { useShallow } from 'zustand/react/shallow'

import { Banner, Box, Text } from '@gorgias/axiom'

import { getPlainTextLength } from 'pages/aiAgent/components/GuidanceEditor/guidanceTextContent.utils'

import { useSkillEditorStore } from './context'

export const SkillEditorPlaygroundBanner = () => {
    const { title, content, intents } = useSkillEditorStore(
        useShallow((storeState) => ({
            title: storeState.state.title,
            content: storeState.state.content,
            intents: storeState.state.intents,
        })),
    )

    const isMissingRequiredFields =
        title.trim() === '' ||
        getPlainTextLength(content) === 0 ||
        intents.length === 0

    if (!isMissingRequiredFields) {
        return null
    }

    return (
        <Banner
            size="md"
            intent="warning"
            icon="warning-triangle"
            isClosable={false}
            title="Testing may not work as expected"
        >
            <Box display="flex" flexWrap="wrap" mt={-8}>
                <Text variant="regular" size="md">
                    A title, instructions and at least one intent are required
                    to test this draft.
                </Text>
            </Box>
        </Banner>
    )
}
