import { Text } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'

type Props = {
    sectionId: string
}

export const SkillEditorSidePanelKnowledgeSection = ({ sectionId }: Props) => {
    return (
        <KnowledgeEditorSidePanelSection
            header={{ title: 'Knowledge' }}
            sectionId={sectionId}
        >
            <Text size="sm" color="content-neutral-secondary">
                Knowledge will be available here.
            </Text>
        </KnowledgeEditorSidePanelSection>
    )
}
