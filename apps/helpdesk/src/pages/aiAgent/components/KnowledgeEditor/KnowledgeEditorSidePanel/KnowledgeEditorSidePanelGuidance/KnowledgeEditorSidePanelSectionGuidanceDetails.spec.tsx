import type { ComponentProps } from 'react'

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
}

const renderComponent = (
    props?: Partial<
        ComponentProps<typeof KnowledgeEditorSidePanelSectionGuidanceDetails>
    >,
) =>
    render(
        <KnowledgeEditorSidePanel initialExpandedSections={['details']}>
            <KnowledgeEditorSidePanelSectionGuidanceDetails
                sectionId="details"
                {...props}
            />
        </KnowledgeEditorSidePanel>,
    )

describe('KnowledgeEditorSidePanelSectionGuidanceDetails', () => {
    beforeEach(() => {
        mockUseGuidanceDetailsFromContext.mockReturnValue(baseDetailsData)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('opens confirmation modal when disabling with linked intents', async () => {
        const user = userEvent.setup()
        renderComponent({ linkedIntentsCount: 2 })

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )

        expect(baseDetailsData.aiAgentStatus.onChange).not.toHaveBeenCalled()
        expect(
            screen.getByRole('heading', {
                name: 'Disable guidance and unlink intents?',
            }),
        ).toBeInTheDocument()
    })

    it('calls disable and unlink callback on confirm', async () => {
        const user = userEvent.setup()
        const onDisableWithLinkedIntents = jest.fn()
        renderComponent({ linkedIntentsCount: 1, onDisableWithLinkedIntents })

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )
        await user.click(screen.getByRole('button', { name: 'Disable' }))

        expect(baseDetailsData.aiAgentStatus.onChange).toHaveBeenCalledTimes(1)
        expect(onDisableWithLinkedIntents).toHaveBeenCalledTimes(1)
    })

    it('calls disable without linked intents callback when none is provided', async () => {
        const user = userEvent.setup()
        renderComponent({ linkedIntentsCount: 1 })

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )
        await user.click(screen.getByRole('button', { name: 'Disable' }))

        expect(baseDetailsData.aiAgentStatus.onChange).toHaveBeenCalledTimes(1)
        expect(
            screen.queryByRole('heading', {
                name: 'Disable guidance and unlink intents?',
            }),
        ).not.toBeInTheDocument()
    })

    it('closes confirmation modal without disabling on cancel', async () => {
        const user = userEvent.setup()
        renderComponent({ linkedIntentsCount: 1 })

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )
        await user.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(baseDetailsData.aiAgentStatus.onChange).not.toHaveBeenCalled()
        expect(
            screen.queryByRole('heading', {
                name: 'Disable guidance and unlink intents?',
            }),
        ).not.toBeInTheDocument()
    })

    it('toggles directly when there are no linked intents', async () => {
        const user = userEvent.setup()
        renderComponent({ linkedIntentsCount: 0 })

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )

        expect(baseDetailsData.aiAgentStatus.onChange).toHaveBeenCalledTimes(1)
        expect(
            screen.queryByRole('heading', {
                name: 'Disable guidance and unlink intents?',
            }),
        ).not.toBeInTheDocument()
    })

    it('toggles directly when linked intents count prop is omitted', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )

        expect(baseDetailsData.aiAgentStatus.onChange).toHaveBeenCalledTimes(1)
        expect(
            screen.queryByRole('heading', {
                name: 'Disable guidance and unlink intents?',
            }),
        ).not.toBeInTheDocument()
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

        renderComponent({ linkedIntentsCount: 2 })

        await user.click(
            screen.getByRole('button', { name: 'Toggle AI agent status' }),
        )

        expect(mockEnableGuidance).toHaveBeenCalledTimes(1)
        expect(
            screen.queryByRole('heading', {
                name: 'Disable guidance and unlink intents?',
            }),
        ).not.toBeInTheDocument()
    })
})
