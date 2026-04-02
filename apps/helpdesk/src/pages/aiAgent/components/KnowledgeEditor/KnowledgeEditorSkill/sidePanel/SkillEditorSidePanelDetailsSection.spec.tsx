import { render, screen } from '@testing-library/react'

import { SkillEditorSidePanelDetailsSection } from './SkillEditorSidePanelDetailsSection'

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

describe('SkillEditorSidePanelDetailsSection', () => {
    it('renders the placeholder text', () => {
        render(<SkillEditorSidePanelDetailsSection sectionId="details" />)

        expect(
            screen.getByText('Details will be available here.'),
        ).toBeInTheDocument()
    })
})
