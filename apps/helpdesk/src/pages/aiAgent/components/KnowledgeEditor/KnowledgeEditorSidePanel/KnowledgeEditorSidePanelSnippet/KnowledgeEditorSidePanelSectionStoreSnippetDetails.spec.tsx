import { render, screen } from '@testing-library/react'

import { Accordion } from 'components/Accordion/Accordion'

import { KnowledgeEditorSidePanelSectionStoreSnippetDetails } from './KnowledgeEditorSidePanelSectionStoreSnippetDetails'

describe('KnowledgeEditorSidePanelSectionStoreSnippetDetails', () => {
    it('renders', () => {
        render(
            <Accordion.Root value={['details']}>
                <KnowledgeEditorSidePanelSectionStoreSnippetDetails
                    aiAgentStatus={{ value: true, onChange: jest.fn() }}
                    createdDatetime={new Date('2025-06-17')}
                    lastUpdatedDatetime={new Date('2025-06-17')}
                    urls={['https://www.url-1.com', 'https://www.url-2.com']}
                    sectionId={'details'}
                />
            </Accordion.Root>,
        )

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('https://www.url-1.com')).toBeInTheDocument()
        expect(screen.getByText('https://www.url-2.com')).toBeInTheDocument()
    })
})
