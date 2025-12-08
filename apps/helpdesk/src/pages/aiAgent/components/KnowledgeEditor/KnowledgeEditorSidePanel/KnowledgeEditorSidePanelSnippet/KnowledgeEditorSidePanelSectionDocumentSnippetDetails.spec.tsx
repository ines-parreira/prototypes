import { render, screen } from '@testing-library/react'

import { Accordion } from 'components/Accordion/Accordion'

import { KnowledgeEditorSidePanelSectionDocumentSnippetDetails } from './KnowledgeEditorSidePanelSectionDocumentSnippetDetails'

describe('KnowledgeEditorSidePanelSectionDocumentSnippetDetails', () => {
    it('renders', () => {
        render(
            <Accordion.Root value={['details']}>
                <KnowledgeEditorSidePanelSectionDocumentSnippetDetails
                    aiAgentStatus={{ value: true, onChange: jest.fn() }}
                    createdDatetime={new Date('2025-06-17')}
                    lastUpdatedDatetime={new Date('2025-06-17')}
                    sourceDocument={'https://some-doc/doc.pdf'}
                    googleStorageUrl={
                        'https://storage.googleapis.com/bucket/doc.pdf'
                    }
                    sectionId={'details'}
                />
            </Accordion.Root>,
        )

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Source document')).toBeInTheDocument()
        expect(screen.getByText('https://some-doc/doc.pdf')).toBeInTheDocument()
    })
})
