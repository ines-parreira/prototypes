import { Text } from '@gorgias/axiom'

import { KnowledgeEditorSidePanelSection } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection'

type Props = {
    sectionId: string
}

export const SkillEditorSidePanelDetailsSection = ({ sectionId }: Props) => {
    return (
        <KnowledgeEditorSidePanelSection
            header={{ title: 'Details' }}
            sectionId={sectionId}
        >
            <Text size="sm" color="content-neutral-secondary">
                Details will be available here.
            </Text>
        </KnowledgeEditorSidePanelSection>
    )
}
