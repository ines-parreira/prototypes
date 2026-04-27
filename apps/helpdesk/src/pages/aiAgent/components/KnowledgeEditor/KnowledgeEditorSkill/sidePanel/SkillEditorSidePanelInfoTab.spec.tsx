import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { SkillEditorSidePanelInfoTab } from './SkillEditorSidePanelInfoTab'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanel',
    () => ({
        KnowledgeEditorSidePanel: ({
            children,
        }: {
            children: React.ReactNode
        }) => <div>{children}</div>,
    }),
)
jest.mock('./SkillEditorSidePanelDetailsSection', () => ({
    SkillEditorSidePanelDetailsSection: () => <div>Details Section</div>,
}))
jest.mock('./SkillEditorSidePanelIntentsSection', () => ({
    SkillEditorSidePanelIntentsSection: () => <div>Intents Section</div>,
}))
jest.mock('./SkillEditorSidePanelKnowledgeSection', () => ({
    SkillEditorSidePanelKnowledgeSection: () => <div>Knowledge Section</div>,
}))

describe('SkillEditorSidePanelInfoTab', () => {
    it('renders all three sections', () => {
        render(<SkillEditorSidePanelInfoTab />)

        expect(screen.getByText('Details Section')).toBeInTheDocument()
        expect(screen.getByText('Intents Section')).toBeInTheDocument()
        expect(screen.getByText('Knowledge Section')).toBeInTheDocument()
    })
})
