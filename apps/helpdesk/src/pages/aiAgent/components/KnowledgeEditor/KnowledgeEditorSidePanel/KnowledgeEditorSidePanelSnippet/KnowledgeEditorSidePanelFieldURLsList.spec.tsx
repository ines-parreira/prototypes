import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSidePanelFieldURLsList } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSnippet/KnowledgeEditorSidePanelFieldURLsList'

describe('KnowledgeEditorSidePanelFieldURLsList', () => {
    it('renders', () => {
        render(
            <KnowledgeEditorSidePanelFieldURLsList
                urls={['https://www.url-1.com', 'https://www.url-2.com']}
            />,
        )

        expect(screen.getByText('Source URLs')).toBeInTheDocument()
        expect(screen.getByText('https://www.url-1.com')).toBeInTheDocument()
        expect(screen.getByText('https://www.url-2.com')).toBeInTheDocument()
    })
})
