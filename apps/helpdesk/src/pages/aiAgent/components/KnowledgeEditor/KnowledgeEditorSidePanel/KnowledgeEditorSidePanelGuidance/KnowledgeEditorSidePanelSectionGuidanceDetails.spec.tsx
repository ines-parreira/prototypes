import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useHistory } from 'react-router-dom'

import { useGuidanceDetailsFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionGuidanceDetails } from './KnowledgeEditorSidePanelSectionGuidanceDetails'

jest.mock('@repo/feature-flags', () => ({
    useFlag: jest.fn().mockReturnValue(false),
    FeatureFlagKey: {
        KnowledgeIntentManagementSystem: 'knowledge-intent-management-system',
    },
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks',
    () => ({
        useGuidanceDetailsFromContext: jest.fn(),
    }),
)

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock
const mockUseHistory = useHistory as jest.Mock
const mockUseAiAgentNavigation = useAiAgentNavigation as jest.Mock

jest.mock('../KnowledgeEditorSidePanelCommonFields', () => ({
    KnowledgeEditorSidePanelFieldAIAgentStatus: ({
        onChange,
        isDisabled,
    }: {
        onChange?: () => void
        isDisabled?: boolean
    }) => (
        <button disabled={isDisabled} onClick={() => onChange?.()}>
            Toggle AI agent status
        </button>
    ),
    KnowledgeEditorSidePanelFieldDateField: ({ date }: { date?: Date }) =>
        date ? <div>{date.toISOString()}</div> : <div>-</div>,
    KnowledgeEditorSidePanelFieldKnowledgeType: () => <div>Guidance</div>,
    KnowledgeEditorSidePanelFieldStatus: ({
        isDraft,
    }: {
        isDraft: boolean
    }) => <div>{isDraft ? 'Draft' : 'Published'}</div>,
}))

const mockUseGuidanceDetailsFromContext =
    useGuidanceDetailsFromContext as jest.Mock

const baseDetailsData = {
    guidanceId: 123,
    shopName: 'test-shop',
    aiAgentStatus: {
        value: true,
        onChange: jest.fn().mockResolvedValue(undefined),
    },
    createdDatetime: new Date('2025-06-17'),
    lastUpdatedDatetime: new Date('2025-06-17'),
    isUpdating: false,
    isDraft: false,
    isViewingHistoricalVersion: false,
    mode: 'read' as const,
    visibilityConflict: {
        isOpen: false,
        message: '',
    },
    closeVisibilityConflictModal: jest.fn(),
    rebaseAndEnableVisibility: jest.fn().mockResolvedValue(undefined),
}

const renderComponent = () =>
    render(
        <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
            <KnowledgeEditorSidePanelSectionGuidanceDetails sectionId="details" />
        </KnowledgeEditorSidePanel>,
    )

describe('KnowledgeEditorSidePanelSectionGuidanceDetails', () => {
    const mockPush = jest.fn()

    beforeEach(() => {
        mockUseGuidanceDetailsFromContext.mockReturnValue(baseDetailsData)
        mockUseHistory.mockReturnValue({ push: mockPush })
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                skillDetail: (id: number) => `/ai-agent/skills/${id}`,
                newSkill: '/ai-agent/skills/new',
            },
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('toggles directly when disabling guidance', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )

        expect(baseDetailsData.aiAgentStatus.onChange).toHaveBeenCalledTimes(1)
    })

    it('toggles directly when enabling guidance', async () => {
        const user = userEvent.setup()
        const mockEnableGuidance = jest.fn().mockResolvedValue(undefined)
        mockUseGuidanceDetailsFromContext.mockReturnValue({
            ...baseDetailsData,
            aiAgentStatus: {
                value: false,
                onChange: mockEnableGuidance,
            },
        })

        renderComponent()

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )

        expect(mockEnableGuidance).toHaveBeenCalledTimes(1)
    })

    it('renders visibility conflict modal from hook state', () => {
        mockUseGuidanceDetailsFromContext.mockReturnValue({
            ...baseDetailsData,
            visibilityConflict: {
                isOpen: true,
                message: 'Conflict details',
            },
        })

        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: "This guidance can't be made visible yet",
            }),
        ).toBeInTheDocument()
        expect(screen.getByText('Conflict details')).toBeInTheDocument()
    })

    it('calls rebase callback from conflict modal action', async () => {
        const user = userEvent.setup()
        const rebaseAndEnableVisibility = jest.fn().mockResolvedValue(undefined)
        mockUseGuidanceDetailsFromContext.mockReturnValue({
            ...baseDetailsData,
            visibilityConflict: {
                isOpen: true,
                message: 'Conflict details',
            },
            rebaseAndEnableVisibility,
        })

        renderComponent()

        await user.click(
            screen.getByRole('button', {
                name: 'Override and make public',
            }),
        )

        expect(rebaseAndEnableVisibility).toHaveBeenCalledTimes(1)
    })

    it('calls close callback from conflict modal cancel action', async () => {
        const user = userEvent.setup()
        const closeVisibilityConflictModal = jest.fn()
        mockUseGuidanceDetailsFromContext.mockReturnValue({
            ...baseDetailsData,
            visibilityConflict: {
                isOpen: true,
                message: 'Conflict details',
            },
            closeVisibilityConflictModal,
        })

        renderComponent()

        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(closeVisibilityConflictModal).toHaveBeenCalledTimes(1)
    })

    describe('Convert to skill', () => {
        it('does not render the convert section when feature flag is off', () => {
            mockUseFlag.mockReturnValue(false)
            renderComponent()

            expect(
                screen.queryByRole('button', { name: /convert to skill/i }),
            ).not.toBeInTheDocument()
        })

        it('renders the convert section when feature flag is on', () => {
            mockUseFlag.mockReturnValue(true)
            renderComponent()

            expect(
                screen.getByRole('button', { name: /convert to skill/i }),
            ).toBeInTheDocument()
        })

        it('opens the convert to skill modal when Convert button is clicked', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /convert to skill/i }),
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Convert guidance into a skill?',
                }),
            ).toBeInTheDocument()
        })

        it('closes the convert to skill modal when Cancel is clicked', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /convert to skill/i }),
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Convert guidance into a skill?',
                }),
            ).toBeInTheDocument()

            await user.click(screen.getByRole('button', { name: 'Cancel' }))

            expect(
                screen.queryByRole('heading', {
                    name: 'Convert guidance into a skill?',
                }),
            ).not.toBeInTheDocument()
        })

        it('navigates to skill detail when guidance has an id and Convert to skill is confirmed', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /convert to skill/i }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Convert to skill' }),
            )

            expect(mockPush).toHaveBeenCalledWith('/ai-agent/skills/123')
        })

        it('navigates to new skill when guidance has no id and Convert to skill is confirmed', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            mockUseGuidanceDetailsFromContext.mockReturnValue({
                ...baseDetailsData,
                guidanceId: undefined,
            })
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /convert to skill/i }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Convert to skill' }),
            )

            expect(mockPush).toHaveBeenCalledWith('/ai-agent/skills/new')
        })

        it('closes the modal after confirming conversion', async () => {
            const user = userEvent.setup()
            mockUseFlag.mockReturnValue(true)
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /convert to skill/i }),
            )
            await user.click(
                screen.getByRole('button', { name: 'Convert to skill' }),
            )

            expect(
                screen.queryByRole('heading', {
                    name: 'Convert guidance into a skill?',
                }),
            ).not.toBeInTheDocument()
        })
    })
})
