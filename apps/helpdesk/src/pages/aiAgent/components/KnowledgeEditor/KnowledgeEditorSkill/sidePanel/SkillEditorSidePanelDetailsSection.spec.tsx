import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useSkillDetailsFromContext } from '../hooks/useSkillDetailsFromContext'
import type { SkillDetailsData } from '../hooks/useSkillDetailsFromContext'
import { SkillEditorSidePanelDetailsSection } from './SkillEditorSidePanelDetailsSection'

jest.mock('../hooks/useSkillDetailsFromContext')
jest.mock('../context', () => ({
    useSkillEditorStore: (
        selector: (state: { state: { skill?: { id?: number } } }) => unknown,
    ) => selector({ state: { skill: { id: 42 } } }),
}))
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

const mockUseSkillDetailsFromContext =
    useSkillDetailsFromContext as jest.MockedFunction<
        typeof useSkillDetailsFromContext
    >

const defaultDetails: SkillDetailsData = {
    status: 'enabled',
    isDraft: false,
    isViewingHistoricalVersion: false,
    createdDatetime: new Date('2024-03-01T00:00:00Z'),
    lastUpdatedDatetime: new Date('2024-03-15T00:00:00Z'),
    mode: 'read',
    isPreview: false,
}

describe('SkillEditorSidePanelDetailsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillDetailsFromContext.mockReturnValue(defaultDetails)
    })

    it('should render Enabled tag when status is enabled', () => {
        render(<SkillEditorSidePanelDetailsSection sectionId="details" />)

        expect(screen.getByText('Enabled')).toBeInTheDocument()
    })

    it('should render Disabled tag when status is disabled and not a draft', () => {
        mockUseSkillDetailsFromContext.mockReturnValue({
            ...defaultDetails,
            status: 'disabled',
            isDraft: false,
        })

        render(<SkillEditorSidePanelDetailsSection sectionId="details" />)

        expect(screen.getByText('Disabled')).toBeInTheDocument()
    })

    it('should render Draft tag when article is a draft', () => {
        mockUseSkillDetailsFromContext.mockReturnValue({
            ...defaultDetails,
            isDraft: true,
        })

        render(<SkillEditorSidePanelDetailsSection sectionId="details" />)

        expect(screen.getByText('Draft')).toBeInTheDocument()
        expect(screen.queryByText('Enabled')).not.toBeInTheDocument()
        expect(screen.queryByText('Disabled')).not.toBeInTheDocument()
    })

    it('hides the "Info" heading when isPreview is true', () => {
        mockUseSkillDetailsFromContext.mockReturnValue({
            ...defaultDetails,
            isPreview: true,
        })

        render(<SkillEditorSidePanelDetailsSection sectionId="details" />)

        expect(screen.queryByText('Info')).not.toBeInTheDocument()
    })

    it('shows the "Info" heading when isPreview is false', () => {
        render(<SkillEditorSidePanelDetailsSection sectionId="details" />)

        expect(screen.getByText('Info')).toBeInTheDocument()
    })
})
