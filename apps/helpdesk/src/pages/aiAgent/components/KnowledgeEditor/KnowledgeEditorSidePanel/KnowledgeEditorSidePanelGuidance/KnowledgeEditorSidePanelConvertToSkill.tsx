import { Box, Button, Text } from '@gorgias/axiom'

type Props = {
    isConvertDisabled: boolean
    onConvert: () => void
}

export const KnowledgeEditorSidePanelConvertToSkill = ({
    isConvertDisabled,
    onConvert,
}: Props) => {
    return (
        <Box display="flex" gap="xs" flexDirection="column">
            <Box display="flex" flexDirection="column" marginTop="md">
                <Text size="md" variant="bold">
                    Convert To Skill
                </Text>
                <Text size="md" color="content-neutral-secondary">
                    Create a skill from this content and link intents so AI
                    Agent knows when to use it.
                </Text>
            </Box>
            <Box>
                <Button
                    size="sm"
                    onClick={onConvert}
                    aria-label="Convert to skill"
                    variant="secondary"
                    isDisabled={isConvertDisabled}
                >
                    Convert
                </Button>
            </Box>
        </Box>
    )
}
