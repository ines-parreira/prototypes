import { render, screen } from '@testing-library/react'

import { Accordion } from 'components/Accordion/Accordion'
import { KnowledgeEditorSidePanelSectionURLSnippetDetails } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelSectionURLSnippetDetails'

describe('KnowledgeEditorSidePanelSectionURLSnippetDetails', () => {
    it('renders', () => {
        render(
            <Accordion.Root value={['details']}>
                <KnowledgeEditorSidePanelSectionURLSnippetDetails
                    aiAgentStatus={{ value: true, onChange: jest.fn() }}
                    createdDatetime={new Date('2025-06-17')}
                    lastUpdatedDatetime={new Date('2025-06-17')}
                    url={'https://www.google.com'}
                    sectionId={'details'}
                />
            </Accordion.Root>,
        )

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Source URL')).toBeInTheDocument()
        expect(screen.getByText('https://www.google.com')).toBeInTheDocument()
    })
})
