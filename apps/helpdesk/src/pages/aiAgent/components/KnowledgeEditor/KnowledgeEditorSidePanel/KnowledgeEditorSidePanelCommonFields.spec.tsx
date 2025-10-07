import { render, screen } from '@testing-library/react'

import {
    KnowledgeEditorSidePanelFieldAIAgentStatus,
    KnowledgeEditorSidePanelFieldDateField,
    KnowledgeEditorSidePanelFieldDescription,
    KnowledgeEditorSidePanelFieldKnowledgeType,
    KnowledgeEditorSidePanelFieldPercentage,
    KnowledgeEditorSidePanelFieldURL,
} from './KnowledgeEditorSidePanelCommonFields'

describe('KnowledgeEditorSidePanelFieldKnowledgeType', () => {
    it('renders type', () => {
        render(
            <KnowledgeEditorSidePanelFieldKnowledgeType type="help-center-article" />,
        )
        expect(screen.getByText('Help Center article')).toBeInTheDocument()

        render(<KnowledgeEditorSidePanelFieldKnowledgeType type="guidance" />)
        expect(screen.getByText('Guidance')).toBeInTheDocument()

        render(
            <KnowledgeEditorSidePanelFieldKnowledgeType type="document-snippet" />,
        )
        expect(screen.getByText('Document')).toBeInTheDocument()

        render(
            <KnowledgeEditorSidePanelFieldKnowledgeType type="url-snippet" />,
        )
        expect(screen.getByText('URL')).toBeInTheDocument()

        render(
            <KnowledgeEditorSidePanelFieldKnowledgeType type="store-snippet" />,
        )
        expect(screen.getByText('Store website')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldAIAgentStatus', () => {
    it('renders enabled', () => {
        render(<KnowledgeEditorSidePanelFieldAIAgentStatus checked={true} />)
        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.getByRole('switch')).toBeChecked()
    })
    it('renders disabled', () => {
        render(<KnowledgeEditorSidePanelFieldAIAgentStatus checked={false} />)
        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.getByRole('switch')).not.toBeChecked()
    })
})

describe('KnowledgeEditorSidePanelFieldDateField', () => {
    it('renders date', () => {
        render(
            <KnowledgeEditorSidePanelFieldDateField
                date={new Date('2025-10-06')}
            />,
        )
        expect(screen.getByText('October 6, 2025')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldURL', () => {
    it('renders URL', () => {
        render(
            <KnowledgeEditorSidePanelFieldURL url="https://www.google.com" />,
        )
        expect(screen.getByText('https://www.google.com')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldDescription', () => {
    it('renders description', () => {
        render(
            <KnowledgeEditorSidePanelFieldDescription description="Description" />,
        )
        expect(screen.getByText('Description')).toBeInTheDocument()
    })
})

describe('KnowledgeEditorSidePanelFieldPercentage', () => {
    it('renders percentage', () => {
        render(<KnowledgeEditorSidePanelFieldPercentage percentage={0.5} />)
        expect(screen.getByText('50%')).toBeInTheDocument()
    })
})
