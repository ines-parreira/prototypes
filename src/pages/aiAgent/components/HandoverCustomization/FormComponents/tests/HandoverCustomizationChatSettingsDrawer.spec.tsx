import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { GorgiasChatIntegration } from 'models/integration/types'
import { useHandoverCustomizationChatFallbackSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm'
import { useHandoverCustomizationChatOfflineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm'
import { useHandoverCustomizationChatOnlineSettingsForm } from 'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm'
import { userEvent } from 'utils/testing/userEvent'

import HandoverCustomizationChatSettingsDrawer, {
    HandoverCustomizationChatSettingsDrawerContent,
    HandoverCustomizationChatSettingsDrawerProps,
} from '../HandoverCustomizationChatSettingsDrawer'

jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOfflineSettingsForm',
)
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatOnlineSettingsForm',
)
jest.mock(
    'pages/aiAgent/hooks/handoverCustomization/useHandoverCustomizationChatFallbackSettingsForm',
)
jest.mock('launchdarkly-react-client-sdk')

const mockIntegration = {
    id: 'test-id',
    meta: {
        app_id: 'test-app-id',
    },
} as unknown as GorgiasChatIntegration

const mockOfflineForm = {
    isLoading: false,
    isSaving: false,
    formValues: {},
    hasChanges: false,
    updateValue: jest.fn(),
    handleOnSave: jest.fn(() => Promise.resolve()),
    handleOnCancel: jest.fn(),
}

const mockOnlineForm = {
    isLoading: false,
    isSaving: false,
    formValues: {},
    hasChanges: false,
    updateValue: jest.fn(),
    handleOnSave: jest.fn(() => Promise.resolve()),
    handleOnCancel: jest.fn(),
}

const mockFallbackForm = {
    isLoading: false,
    isSaving: false,
    formValues: {},
    hasChanges: false,
    updateValue: jest.fn(),
    handleOnSave: jest.fn(() => Promise.resolve()),
    handleOnCancel: jest.fn(),
}

const defaultProps: HandoverCustomizationChatSettingsDrawerProps = {
    integration: mockIntegration,
    activeContent: 'offline',
    onClose: jest.fn(),
    open: true,
    setIsFormDirty: jest.fn(),
}

const renderDrawer = (
    props: HandoverCustomizationChatSettingsDrawerProps = defaultProps,
) => {
    return render(<HandoverCustomizationChatSettingsDrawer {...props} />)
}

describe('HandoverCustomizationChatSettingsDrawer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(
            useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
        ).mockReturnValue(mockOfflineForm)
        ;(
            useHandoverCustomizationChatOnlineSettingsForm as jest.Mock
        ).mockReturnValue(mockOnlineForm)
        ;(
            useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
        ).mockReturnValue(mockFallbackForm)
    })

    it('displays drawer with offline content', () => {
        renderDrawer()

        expect(screen.getByText('When Chat is offline')).toBeInTheDocument()
    })

    it('displays drawer with online content', () => {
        renderDrawer({ ...defaultProps, activeContent: 'online' })

        expect(screen.getByText('When Chat is online')).toBeInTheDocument()
    })

    it('displays drawer with error content', () => {
        renderDrawer({ ...defaultProps, activeContent: 'error' })

        expect(screen.getByText('When an error occurs')).toBeInTheDocument()
    })

    it('calls onClose and handleOnCancel when drawer is closed', async () => {
        const onClose = jest.fn()
        renderDrawer({ ...defaultProps, onClose })

        const closeButton = screen.getByRole('button', { name: /cancel/i })
        await userEvent.click(closeButton)

        expect(onClose).toHaveBeenCalled()
        expect(mockOfflineForm.handleOnCancel).toHaveBeenCalled()
    })

    it('calls onBackdropClick when user clicks on backdrop', async () => {
        const onClose = jest.fn()
        renderDrawer({ ...defaultProps, onClose })

        const backdrop = screen.getByRole('presentation')
        await userEvent.click(backdrop)

        expect(onClose).toHaveBeenCalled()
    })

    it('calls onSave and onClose when drawer is saved', async () => {
        const onClose = jest.fn()
        renderDrawer({ ...defaultProps, onClose })

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        await userEvent.click(saveButton)

        expect(onClose).toHaveBeenCalled()
        expect(mockOfflineForm.handleOnSave).toHaveBeenCalled()
    })

    it('calls onSave and not onClose when drawer is saved and there are an error', async () => {
        mockOfflineForm.handleOnSave.mockImplementation(() =>
            Promise.reject('Error'),
        )
        const onClose = jest.fn()
        renderDrawer({ ...defaultProps, onClose })

        const saveButton = screen.getByRole('button', { name: /save changes/i })
        userEvent.click(saveButton)

        expect(onClose).not.toHaveBeenCalled()
        expect(mockOfflineForm.handleOnSave).toHaveBeenCalled()
    })

    it('open the unsaved changes modal when user clicks on backdrop and there are unsaved changes for the offline content', async () => {
        ;(
            useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
        ).mockReturnValue({ ...mockOfflineForm, hasChanges: true })
        const onClose = jest.fn()

        renderDrawer({ ...defaultProps, onClose })

        await userEvent.click(screen.getByRole('presentation'))

        expect(onClose).not.toHaveBeenCalled()
        expect(
            screen.queryByText(
                /Your changes to this page will be lost if you don’t save them./i,
            ),
        ).toBeInTheDocument()
    })

    it('open the unsaved changes modal when user clicks on backdrop and there are unsaved changes for the online content', async () => {
        ;(
            useHandoverCustomizationChatOnlineSettingsForm as jest.Mock
        ).mockReturnValue({ ...mockOnlineForm, hasChanges: true })
        const onClose = jest.fn()

        renderDrawer({ ...defaultProps, activeContent: 'online', onClose })

        await userEvent.click(screen.getByRole('presentation'))

        expect(onClose).not.toHaveBeenCalled()
        expect(
            screen.queryByText(
                /Your changes to this page will be lost if you don’t save them./i,
            ),
        ).toBeInTheDocument()
    })

    it('open the unsaved changes modal when user clicks on backdrop and there are unsaved changes for the error content', async () => {
        ;(
            useHandoverCustomizationChatFallbackSettingsForm as jest.Mock
        ).mockReturnValue({ ...mockFallbackForm, hasChanges: true })
        const onClose = jest.fn()

        renderDrawer({ ...defaultProps, activeContent: 'error', onClose })

        await userEvent.click(screen.getByRole('presentation'))

        expect(onClose).not.toHaveBeenCalled()
        expect(
            screen.queryByText(
                /Your changes to this page will be lost if you don’t save them./i,
            ),
        ).toBeInTheDocument()
    })

    it.each([
        { activeContent: 'offline', onClose: mockOfflineForm.handleOnCancel },
        { activeContent: 'online', onClose: mockOnlineForm.handleOnCancel },
        { activeContent: 'error', onClose: mockFallbackForm.handleOnCancel },
    ])(
        'does not open the unsaved changes modal when user clicks on backdrop and there are no unsaved changes for the %s content',
        async ({ activeContent, onClose }) => {
            renderDrawer({
                ...defaultProps,
                activeContent:
                    activeContent as HandoverCustomizationChatSettingsDrawerContent,
                onClose,
            })

            await userEvent.click(screen.getByRole('presentation'))

            expect(onClose).toHaveBeenCalled()
            expect(
                screen.queryByText(
                    /Your changes to this page will be lost if you don’t save them./i,
                ),
            ).not.toBeInTheDocument()
        },
    )

    it('displays loading state when isLoading is true', () => {
        ;(
            useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
        ).mockReturnValue({
            ...mockOfflineForm,
            isLoading: true,
        })

        renderDrawer()

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('displays loading state when isSaving is true', () => {
        ;(
            useHandoverCustomizationChatOfflineSettingsForm as jest.Mock
        ).mockReturnValue({
            ...mockOfflineForm,
            isSaving: true,
        })

        renderDrawer()

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('does not display content when integration is missing', () => {
        renderDrawer({ ...defaultProps, integration: null as any })

        expect(screen.getByText('When Chat is offline')).toBeInTheDocument()
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it.each([
        { activeContent: 'online', onCancel: mockOnlineForm.handleOnCancel },
        { activeContent: 'offline', onCancel: mockOfflineForm.handleOnCancel },
        { activeContent: 'error', onCancel: mockFallbackForm.handleOnCancel },
    ])(
        'calls onClose and handleOnCancel for %s content',
        async ({ activeContent, onCancel }) => {
            const onClose = jest.fn()

            renderDrawer({
                ...defaultProps,
                activeContent:
                    activeContent as HandoverCustomizationChatSettingsDrawerContent,
                onClose,
            })

            const closeButton = screen.getByRole('button', { name: /cancel/i })
            await userEvent.click(closeButton)

            expect(onClose).toHaveBeenCalled()
            expect(onCancel).toHaveBeenCalled()
        },
    )

    describe('updateValue calls', () => {
        it('calls updateValue for offline instructions', async () => {
            renderDrawer()

            await act(async () => {
                const instructionsInput = screen.getByRole('textbox', {
                    name: /instructions/i,
                })
                await userEvent.type(
                    instructionsInput,
                    'New offline instructions',
                )
            })

            expect(mockOfflineForm.updateValue).toHaveBeenCalledWith(
                'offlineInstructions',
                'New offline instructions',
            )
        })

        it('calls updateValue for business hours', async () => {
            renderDrawer()

            await act(async () => {
                const businessHoursToggle = screen.getByRole('switch', {
                    name: /share business hours in handover message/i,
                })
                fireEvent.click(businessHoursToggle)
            })

            expect(mockOfflineForm.updateValue).toHaveBeenCalledWith(
                'shareBusinessHours',
                true,
            )
        })

        it('calls updateValue for online instructions', async () => {
            renderDrawer({ ...defaultProps, activeContent: 'online' })

            await act(async () => {
                const instructionsInput = screen.getByRole('textbox', {
                    name: /instructions/i,
                })
                await userEvent.type(
                    instructionsInput,
                    'New online instructions',
                )
            })

            expect(mockOnlineForm.updateValue).toHaveBeenCalledWith(
                'onlineInstructions',
                'New online instructions',
            )
        })

        it('calls updateValue for email capture enabled', async () => {
            renderDrawer({ ...defaultProps, activeContent: 'online' })

            await act(async () => {
                const emailCaptureToggle = screen.getByRole('switch', {
                    name: /enable email capture/i,
                })
                await fireEvent.click(emailCaptureToggle)
            })

            expect(mockOnlineForm.updateValue).toHaveBeenCalledWith(
                'emailCaptureEnabled',
                true,
            )
        })

        it('calls updateValue for email capture enforcement', async () => {
            renderDrawer({ ...defaultProps, activeContent: 'online' })

            await act(async () => {
                const enforcementRadio = screen.getByRole('radio', {
                    name: /required/i,
                })
                await fireEvent.click(enforcementRadio)
            })

            expect(mockOnlineForm.updateValue).toHaveBeenCalledWith(
                'emailCaptureEnforcement',
                'always-required',
            )
        })

        it('calls updateValue for auto responder enabled', async () => {
            renderDrawer({ ...defaultProps, activeContent: 'online' })

            await act(async () => {
                const autoResponderToggle = screen.getByRole('switch', {
                    name: /provide auto-reply wait time in the chat/i,
                })
                await fireEvent.click(autoResponderToggle)
            })

            expect(mockOnlineForm.updateValue).toHaveBeenCalledWith(
                'autoResponderEnabled',
                true,
            )
        })

        it('calls updateValue for auto responder reply', async () => {
            renderDrawer({ ...defaultProps, activeContent: 'online' })

            await act(async () => {
                const replyRadio = screen.getByRole('radio', {
                    name: /dynamic wait time/i,
                })
                await fireEvent.click(replyRadio)
            })

            expect(mockOnlineForm.updateValue).toHaveBeenCalledWith(
                'autoResponderReply',
                'reply-dynamic',
            )
        })

        it('calls updateValue for fallback message', async () => {
            renderDrawer({ ...defaultProps, activeContent: 'error' })

            await act(async () => {
                const fallbackInput = screen.getByRole('textbox', {
                    name: /error message/i,
                })
                await userEvent.type(fallbackInput, 'New fallback message')
            })

            expect(mockFallbackForm.updateValue).toHaveBeenCalledWith(
                'fallbackMessage',
                'en-US',
                'New fallback message',
            )
        })
    })
})
