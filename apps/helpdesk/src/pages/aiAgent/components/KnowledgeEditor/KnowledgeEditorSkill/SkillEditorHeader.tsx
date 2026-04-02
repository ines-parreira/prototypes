import { Box, Button } from '@gorgias/axiom'

import { KnowledgeEditorTopBarTitle } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/KnowledgeEditorTopBarTitle'

type Props = {
    title: string
    onChangeTitle?: (newTitle: string) => void
    onBack: () => void
    children?: React.ReactNode
}

export const SkillEditorHeader = ({
    title,
    onChangeTitle,
    onBack,
    children,
}: Props) => {
    return (
        <Box
            alignItems="center"
            justifyContent="space-between"
            padding="lg"
            height="80px"
        >
            <Box alignItems="center" gap="sm" flex={1}>
                <Button
                    variant="secondary"
                    size="sm"
                    icon="arrow-left"
                    aria-label="Back to skills"
                    onClick={onBack}
                />
                <KnowledgeEditorTopBarTitle
                    onChangeTitle={onChangeTitle}
                    title={title}
                />
            </Box>
            <Box gap="xs" alignItems="center">
                {children}
            </Box>
        </Box>
    )
}
