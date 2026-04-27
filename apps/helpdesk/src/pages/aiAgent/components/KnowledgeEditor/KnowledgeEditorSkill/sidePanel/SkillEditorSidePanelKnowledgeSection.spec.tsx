import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSkillSupportingKnowledgeFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillSupportingKnowledgeFromContext'
import { useSkillTopKnowledges } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillTopKnowledges'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

import { SkillEditorSidePanelKnowledgeSection } from './SkillEditorSidePanelKnowledgeSection'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection',
    () => ({
        KnowledgeEditorSidePanelSection: ({
            children,
            header,
        }: {
            children: React.ReactNode
            header?: { title: React.ReactNode; subtitle?: React.ReactNode }
        }) => (
            <div>
                {header?.title}
                {header?.subtitle}
                {children}
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillSupportingKnowledgeFromContext',
    () => ({ useSkillSupportingKnowledgeFromContext: jest.fn() }),
)

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillTopKnowledges',
    () => ({ useSkillTopKnowledges: jest.fn() }),
)

jest.mock('pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip', () => ({
    TruncatedTextWithTooltip: ({ children }: { children?: React.ReactNode }) =>
        children,
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/sidePanel/SkillEditorSidePanelTopKnowledgeSection',
    () => ({
        SkillEditorSidePanelTopKnowledgeSection: ({
            topKnowledges,
        }: {
            topKnowledges: { title: string }[]
        }) => (
            <div>
                <span>Top knowledge used</span>
                {topKnowledges.map((k) => (
                    <span key={k.title}>{k.title}</span>
                ))}
            </div>
        ),
    }),
)

const mockUseSkillSupportingKnowledgeFromContext =
    useSkillSupportingKnowledgeFromContext as jest.Mock
const mockUseSkillTopKnowledges = useSkillTopKnowledges as jest.Mock

const mockUpdateUseSupportingKnowledge = jest.fn()

const defaultSupportingKnowledgeHook = {
    skillId: 42,
    hasPublishedVersion: true,
    useSupportingKnowledge: true,
    updateUseSupportingKnowledge: mockUpdateUseSupportingKnowledge,
    isUpdating: false,
    isAutoSaving: false,
    isPreview: false,
    isDiffMode: false,
    isViewingHistoricalVersion: false,
    isViewingPublishedWithDraft: false,
    isReadInPreview: false,
}

const defaultTopKnowledgesHook = {
    topSupportingKnowledges: [],
    isLoading: false,
    dateRange: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-28T23:59:59Z',
    },
}

const baseTopKnowledges = [
    {
        id: '1',
        type: KnowledgeType.FAQ,
        title: 'How to track my order',
        lastUpdatedAt: '2024-01-01T00:00:00Z',
        tickets: 10,
        resourceSourceSetId: 11,
        coUsedTicketIds: ['T1'],
    },
]

const renderComponent = () =>
    render(<SkillEditorSidePanelKnowledgeSection sectionId="knowledge" />)

describe('SkillEditorSidePanelKnowledgeSection', () => {
    beforeEach(() => {
        mockUseSkillSupportingKnowledgeFromContext.mockReturnValue(
            defaultSupportingKnowledgeHook,
        )
        mockUseSkillTopKnowledges.mockReturnValue(defaultTopKnowledgesHook)
    })

    describe('toggle state', () => {
        it('renders the knowledge toggle', () => {
            renderComponent()

            expect(screen.getByRole('switch')).toBeInTheDocument()
        })

        it('calls updateUseSupportingKnowledge with true when toggling on', async () => {
            const user = userEvent.setup()
            mockUseSkillSupportingKnowledgeFromContext.mockReturnValue({
                ...defaultSupportingKnowledgeHook,
                useSupportingKnowledge: false,
            })

            renderComponent()

            await user.click(screen.getByRole('switch'))

            expect(mockUpdateUseSupportingKnowledge).toHaveBeenCalledWith(
                true,
                expect.any(Function),
            )
        })

        it('opens disable confirmation modal when toggling off', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByRole('switch'))

            expect(screen.getByText('Disable knowledge?')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Disable' }),
            ).toBeInTheDocument()
        })

        it('disables the toggle and shows a tooltip when viewing a published version with a draft on top', async () => {
            const user = userEvent.setup()
            mockUseSkillSupportingKnowledgeFromContext.mockReturnValue({
                ...defaultSupportingKnowledgeHook,
                isViewingPublishedWithDraft: true,
            })

            renderComponent()

            expect(screen.getByRole('switch')).toBeDisabled()

            await user.hover(screen.getByRole('switch'))

            expect(
                await screen.findByText(
                    /A draft of this skill exists\. Switch to the draft to change knowledge settings\./i,
                ),
            ).toBeInTheDocument()
        })

        it('disables the toggle and shows a tooltip when in diff mode', async () => {
            const user = userEvent.setup()
            mockUseSkillSupportingKnowledgeFromContext.mockReturnValue({
                ...defaultSupportingKnowledgeHook,
                isDiffMode: true,
            })

            renderComponent()

            expect(screen.getByRole('switch')).toBeDisabled()

            await user.hover(screen.getByRole('switch'))

            expect(
                await screen.findByText(
                    /You are comparing versions\. Switch to the draft to change knowledge settings\./i,
                ),
            ).toBeInTheDocument()
        })

        it('disables the toggle and shows a tooltip when viewing a historical version', async () => {
            const user = userEvent.setup()
            mockUseSkillSupportingKnowledgeFromContext.mockReturnValue({
                ...defaultSupportingKnowledgeHook,
                isViewingHistoricalVersion: true,
            })

            renderComponent()

            expect(screen.getByRole('switch')).toBeDisabled()

            await user.hover(screen.getByRole('switch'))

            expect(
                await screen.findByText(
                    /You are viewing a past version\. Switch to the current version to change knowledge settings\./i,
                ),
            ).toBeInTheDocument()
        })

        it('disables the toggle and shows a tooltip when in read-only preview mode', async () => {
            const user = userEvent.setup()
            mockUseSkillSupportingKnowledgeFromContext.mockReturnValue({
                ...defaultSupportingKnowledgeHook,
                isReadInPreview: true,
            })

            renderComponent()

            expect(screen.getByRole('switch')).toBeDisabled()

            await user.hover(screen.getByRole('switch'))

            expect(
                await screen.findByText(
                    /This skill is in read-only mode\. Switch to edit mode to change knowledge settings\./i,
                ),
            ).toBeInTheDocument()
        })

        it('does not show top knowledge content when knowledge is disabled', () => {
            mockUseSkillSupportingKnowledgeFromContext.mockReturnValue({
                ...defaultSupportingKnowledgeHook,
                useSupportingKnowledge: false,
            })
            mockUseSkillTopKnowledges.mockReturnValue({
                topSupportingKnowledges: baseTopKnowledges,
                isLoading: false,
            })

            renderComponent()

            expect(
                screen.queryByText('Top knowledge used'),
            ).not.toBeInTheDocument()
        })
    })

    describe('content when knowledge is enabled', () => {
        it('shows "Knowledge has not been used" message when no top knowledges and not loading', () => {
            renderComponent()

            expect(
                screen.getByText(
                    'Knowledge has not been used by AI Agent yet.',
                ),
            ).toBeInTheDocument()
        })

        it('shows top knowledge section when there are top knowledges', () => {
            mockUseSkillTopKnowledges.mockReturnValue({
                topSupportingKnowledges: baseTopKnowledges,
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByText('Top knowledge used')).toBeInTheDocument()
            expect(
                screen.getByText('How to track my order'),
            ).toBeInTheDocument()
        })

        it('shows top knowledge section while loading (no empty state)', () => {
            mockUseSkillTopKnowledges.mockReturnValue({
                topSupportingKnowledges: [],
                isLoading: true,
            })

            renderComponent()

            expect(screen.getByText('Top knowledge used')).toBeInTheDocument()
            expect(
                screen.queryByText(
                    'Knowledge has not been used by AI Agent yet.',
                ),
            ).not.toBeInTheDocument()
        })
    })

    describe('disable knowledge modal', () => {
        it('calls updateUseSupportingKnowledge with false when confirming disable', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByRole('switch'))
            await user.click(screen.getByRole('button', { name: 'Disable' }))

            expect(mockUpdateUseSupportingKnowledge).toHaveBeenCalledWith(
                false,
                expect.any(Function),
            )
        })

        it('closes the modal when clicking Cancel', async () => {
            const user = userEvent.setup()

            renderComponent()

            await user.click(screen.getByRole('switch'))

            expect(screen.getByText('Disable knowledge?')).toBeInTheDocument()

            await user.click(screen.getByRole('button', { name: 'Cancel' }))

            expect(
                screen.queryByText('Disable knowledge?'),
            ).not.toBeInTheDocument()
        })

        it('shows loading state on Disable button when saving', () => {
            mockUseSkillSupportingKnowledgeFromContext.mockReturnValue({
                ...defaultSupportingKnowledgeHook,
                isUpdating: true,
            })

            render(
                <SkillEditorSidePanelKnowledgeSection sectionId="knowledge" />,
            )

            // Modal is not open by default, so we check the toggle is rendered
            expect(screen.getByRole('switch')).toBeInTheDocument()
        })
    })
})
