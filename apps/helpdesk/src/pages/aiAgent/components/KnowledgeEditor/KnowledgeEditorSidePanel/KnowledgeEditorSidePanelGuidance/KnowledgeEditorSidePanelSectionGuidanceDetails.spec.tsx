import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGuidanceDetailsFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'

import { KnowledgeEditorSidePanel } from '../KnowledgeEditorSidePanel'
import { KnowledgeEditorSidePanelSectionGuidanceDetails } from './KnowledgeEditorSidePanelSectionGuidanceDetails'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks',
    () => ({
        useGuidanceDetailsFromContext: jest.fn(),
    }),
)

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
    aiAgentStatus: {
        value: true,
        onChange: jest.fn().mockResolvedValue(undefined),
    },
    createdDatetime: new Date('2025-06-17'),
    lastUpdatedDatetime: new Date('2025-06-17'),
    isUpdating: false,
    isDraft: false,
    isViewingHistoricalVersion: false,
    guidanceMode: 'read' as const,
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
    beforeEach(() => {
        mockUseGuidanceDetailsFromContext.mockReturnValue(baseDetailsData)
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
})
