import { render, screen } from '@testing-library/react'

import { SkillEditorSidePanelKnowledgeSection } from './SkillEditorSidePanelKnowledgeSection'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection',
    () => ({
        KnowledgeEditorSidePanelSection: ({
            children,
        }: {
            children: React.ReactNode
        }) => <div>{children}</div>,
    }),
)

describe('SkillEditorSidePanelKnowledgeSection', () => {
    it('renders the placeholder text', () => {
        render(<SkillEditorSidePanelKnowledgeSection sectionId="knowledge" />)

        expect(
            screen.getByText('Knowledge will be available here.'),
        ).toBeInTheDocument()
    })
})
