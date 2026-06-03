import type React from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/types'
import { usePageTopBanner } from 'pages/common/hooks/usePageTopBanner'
import { useChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import { updateOrCreateIntegration } from 'state/integrations/actions'

import { ChatRedesignOptInBanner } from './ChatRedesignOptInBanner'

const mockSetIsPreviewingNewChat = jest.fn()
let mockIsPreviewingNewChat = false

jest.mock('hooks/useAppDispatch')
jest.mock('pages/common/hooks/usePageTopBanner')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn',
)
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp',
)
jest.mock('pages/integrations/integration/hooks/useStoreIntegration')
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanelContext: () => ({
            isPreviewingNewChat: mockIsPreviewingNewChat,
            setIsPreviewingNewChat: mockSetIsPreviewingNewChat,
        }),
    }),
)

jest.mock('state/integrations/actions', () => ({
    ...jest.requireActual('state/integrations/actions'),
    updateOrCreateIntegration: jest.fn(() => () => Promise.resolve()),
}))

const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockUsePageTopBanner = usePageTopBanner as jest.MockedFunction<
    typeof usePageTopBanner
>
const mockUseChatRedesignOptIn = useChatRedesignOptIn as jest.MockedFunction<
    typeof useChatRedesignOptIn
>
const mockUseShouldShowChatSettingsRevamp =
    useShouldShowChatSettingsRevamp as jest.MockedFunction<
        typeof useShouldShowChatSettingsRevamp
    >
const mockUseStoreIntegration = useStoreIntegration as jest.MockedFunction<
    typeof useStoreIntegration
>
const mockUpdateOrCreateIntegration = jest.mocked(updateOrCreateIntegration)

const mockDispatch = jest.fn().mockResolvedValue({})

const integration = fromJS({
    id: 42,
    type: IntegrationType.GorgiasChat,
    meta: { app_id: 'app-42' },
})

const defaultShouldShowFlags = {
    isChatSettingsRevampEnabled: false,
    isChatSettingsScreensRevampFlowsEnabled: false,
    isChatSettingsScreensRevampOrderManagementEnabled: false,
    isNonAiAgentChat2RevampEnabled: true,
    shouldShowChatSettingsRevamp: false,
    shouldShowNonAiAgentChatSettingsRevamp: true,
    shouldShowLegacyChatCustomization: true,
    shouldShowFlowsScreensRevamp: false,
    shouldShowOrderManagementScreensRevamp: false,
    shouldShowNonAiAgentRevamp: false,
    isLoading: false,
}

beforeEach(() => {
    jest.clearAllMocks()
    mockIsPreviewingNewChat = false
    mockUseAppDispatch.mockReturnValue(mockDispatch as any)
    mockUsePageTopBanner.mockReturnValue({
        pageTopBannerRef: { current: null },
        warpToPageTopBanner: (node: React.ReactNode) =>
            node as unknown as React.ReactPortal,
    })
    mockUseStoreIntegration.mockReturnValue({
        storeIntegration: undefined,
        isConnected: false,
        isConnectedToShopify: false,
    })
    mockUseShouldShowChatSettingsRevamp.mockReturnValue(defaultShouldShowFlags)
    mockUseChatRedesignOptIn.mockReturnValue({
        isOptedIn: false,
        optInDatetime: undefined,
    })
})

describe('<ChatRedesignOptInBanner />', () => {
    it('renders nothing when the non-AI-agent revamp should not be shown', () => {
        mockUseShouldShowChatSettingsRevamp.mockReturnValue({
            ...defaultShouldShowFlags,
            shouldShowNonAiAgentChatSettingsRevamp: false,
        })

        const { container } = render(
            <ChatRedesignOptInBanner integration={integration} />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    describe('default state (not opted in, not previewing)', () => {
        it('renders the preview copy with a Preview button', () => {
            render(<ChatRedesignOptInBanner integration={integration} />)

            expect(
                screen.getByText('A fresh look for chat'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Preview' }),
            ).toBeInTheDocument()
        })

        it('starts the Chat 2.0 preview when Preview is clicked', async () => {
            const user = userEvent.setup()
            render(<ChatRedesignOptInBanner integration={integration} />)

            await user.click(screen.getByRole('button', { name: 'Preview' }))

            expect(mockSetIsPreviewingNewChat).toHaveBeenCalledWith(true)
            expect(mockUpdateOrCreateIntegration).not.toHaveBeenCalled()
        })
    })

    describe('previewing state (not opted in, previewing)', () => {
        beforeEach(() => {
            mockIsPreviewingNewChat = true
        })

        it('renders Publish and Revert buttons', () => {
            render(<ChatRedesignOptInBanner integration={integration} />)

            expect(
                screen.getByText("You're previewing the new chat"),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Revert' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Publish' }),
            ).toBeInTheDocument()
        })

        it('exits the preview when Revert is clicked, without persisting', async () => {
            const user = userEvent.setup()
            render(<ChatRedesignOptInBanner integration={integration} />)

            await user.click(screen.getByRole('button', { name: 'Revert' }))

            expect(mockSetIsPreviewingNewChat).toHaveBeenCalledWith(false)
            expect(mockUpdateOrCreateIntegration).not.toHaveBeenCalled()
        })

        it('persists the opt-in and exits preview when Publish is confirmed', async () => {
            const user = userEvent.setup()
            render(<ChatRedesignOptInBanner integration={integration} />)

            await user.click(screen.getByRole('button', { name: 'Publish' }))

            const publishButtons = screen.getAllByRole('button', {
                name: 'Publish',
            })
            await user.click(publishButtons[publishButtons.length - 1])

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalledTimes(1)
            const form = mockUpdateOrCreateIntegration.mock.calls[0][0] as any
            expect(form.get('id')).toBe(42)
            expect(
                form.getIn(['meta', 'chat_redesign_opt_in_datetime']),
            ).toEqual(expect.any(String))

            await waitFor(() =>
                expect(mockSetIsPreviewingNewChat).toHaveBeenCalledWith(false),
            )
        })
    })

    describe('published state (opted in)', () => {
        beforeEach(() => {
            mockUseChatRedesignOptIn.mockReturnValue({
                isOptedIn: true,
                optInDatetime: '2026-05-01T00:00:00Z',
            })
        })

        it('renders the opted-in copy with a Switch back button', () => {
            render(<ChatRedesignOptInBanner integration={integration} />)

            expect(
                screen.getByText("You're on the updated chat"),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Switch back' }),
            ).toBeInTheDocument()
        })

        it('dispatches an opt-out (null datetime) when switching back', async () => {
            const user = userEvent.setup()
            render(<ChatRedesignOptInBanner integration={integration} />)

            await user.click(
                screen.getByRole('button', { name: 'Switch back' }),
            )

            const switchBackButtons = screen.getAllByRole('button', {
                name: 'Switch back',
            })
            await user.click(switchBackButtons[switchBackButtons.length - 1])

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalledTimes(1)
            const form = mockUpdateOrCreateIntegration.mock.calls[0][0] as any
            expect(
                form.getIn(['meta', 'chat_redesign_opt_in_datetime']),
            ).toBeNull()
        })
    })

    describe('unsaved changes guard', () => {
        const mockOnSaveChanges = jest.fn().mockResolvedValue(undefined)
        const mockOnDiscardChanges = jest.fn()

        const renderWithGuard = (isDirty: boolean) =>
            render(
                <ChatRedesignOptInBanner
                    integration={integration}
                    isDirty={isDirty}
                    onSaveChanges={mockOnSaveChanges}
                    onDiscardChanges={mockOnDiscardChanges}
                />,
            )

        beforeEach(() => {
            mockOnSaveChanges.mockClear()
            mockOnDiscardChanges.mockClear()
        })

        it('runs the action directly when there are no unsaved changes', async () => {
            const user = userEvent.setup()
            renderWithGuard(false)

            await user.click(screen.getByRole('button', { name: 'Preview' }))

            expect(mockSetIsPreviewingNewChat).toHaveBeenCalledWith(true)
            expect(
                screen.queryByText('Save your changes?'),
            ).not.toBeInTheDocument()
        })

        it('prompts to save before running the action when there are unsaved changes', async () => {
            const user = userEvent.setup()
            renderWithGuard(true)

            await user.click(screen.getByRole('button', { name: 'Preview' }))

            expect(screen.getByText('Save your changes?')).toBeInTheDocument()
            expect(mockSetIsPreviewingNewChat).not.toHaveBeenCalled()
        })

        it('saves then runs the action when "Save & continue" is chosen', async () => {
            const user = userEvent.setup()
            renderWithGuard(true)

            await user.click(screen.getByRole('button', { name: 'Preview' }))
            await user.click(
                screen.getByRole('button', { name: 'Save & continue' }),
            )

            expect(mockOnSaveChanges).toHaveBeenCalledTimes(1)
            await waitFor(() =>
                expect(mockSetIsPreviewingNewChat).toHaveBeenCalledWith(true),
            )
        })

        it('discards then runs the action when "Discard changes" is chosen', async () => {
            const user = userEvent.setup()
            renderWithGuard(true)

            await user.click(screen.getByRole('button', { name: 'Preview' }))
            await user.click(
                screen.getByRole('button', { name: 'Discard changes' }),
            )

            expect(mockOnDiscardChanges).toHaveBeenCalledTimes(1)
            expect(mockSetIsPreviewingNewChat).toHaveBeenCalledWith(true)
            expect(mockOnSaveChanges).not.toHaveBeenCalled()
        })

        it('guards Publish too: opens the publish modal only after saving', async () => {
            const user = userEvent.setup()
            mockIsPreviewingNewChat = true
            renderWithGuard(true)

            await user.click(screen.getByRole('button', { name: 'Publish' }))

            // Unsaved-changes prompt first; publish confirm not shown yet.
            expect(screen.getByText('Save your changes?')).toBeInTheDocument()
            expect(
                screen.queryByText('Publish the new chat?'),
            ).not.toBeInTheDocument()

            await user.click(
                screen.getByRole('button', { name: 'Save & continue' }),
            )

            expect(mockOnSaveChanges).toHaveBeenCalledTimes(1)
            await waitFor(() =>
                expect(
                    screen.getByText('Publish the new chat?'),
                ).toBeInTheDocument(),
            )
        })
    })
})
