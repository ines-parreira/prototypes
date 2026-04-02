import { render, screen } from '@testing-library/react'

import { SkillEditorSidePanelIntentsSection } from './SkillEditorSidePanelIntentsSection'

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

describe('SkillEditorSidePanelIntentsSection', () => {
    it('renders the placeholder text', () => {
        render(<SkillEditorSidePanelIntentsSection sectionId="intents" />)

        expect(
            screen.getByText('Intents will be available here.'),
        ).toBeInTheDocument()
    })
})
