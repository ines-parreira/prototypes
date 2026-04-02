import { Text } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'

type Props = {
    sectionId: string
}

export const SkillEditorSidePanelIntentsSection = ({ sectionId }: Props) => {
    return (
        <KnowledgeEditorSidePanelSection
            header={{ title: 'Intents' }}
            sectionId={sectionId}
        >
            <Text size="sm" color="content-neutral-secondary">
                Intents will be available here.
            </Text>
        </KnowledgeEditorSidePanelSection>
    )
}
