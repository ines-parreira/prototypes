import { useCallback, useState } from 'react'

import type { Map } from 'immutable'

import {
    Box,
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
    toast,
} from '@gorgias/axiom'

import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { ChatRedesignSwitchConfirmModal } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatRedesignSwitchConfirmModal/ChatRedesignSwitchConfirmModal'
import { useChatRedesignCutoffDate } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignCutoffDate'
import { useChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn'
import { useLogMigrationEvent } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useLogMigrationEvent'
import { useSetChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useSetChatRedesignOptIn'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'

import css from './ChatRedesignOptInBanner.less'

type Props = {
    integration: Map<any, any>
    isDirty?: boolean
    onSaveChanges?: () => Promise<unknown> | void
    onDiscardChanges?: () => void
}

export const ChatRedesignOptInBanner = ({
    integration,
    isDirty = false,
    onSaveChanges,
    onDiscardChanges,
}: Props) => {
    const { storeIntegration } = useStoreIntegration(integration)

    const { shouldShowNonAiAgentChatSettingsRevamp } =
        useShouldShowChatSettingsRevamp(storeIntegration, integration.get('id'))

    const { isOptedIn } = useChatRedesignOptIn(integration.get('id'))
    const cutoffDateLabel = useChatRedesignCutoffDate()
    const { isPreviewingNewChat, setIsPreviewingNewChat } =
        useChatPreviewPanelContext()
    const { setOptIn } = useSetChatRedesignOptIn(integration)
    const { logPreviewModeSwitched, logOptInConfirmed } = useLogMigrationEvent()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSwitching, setIsSwitching] = useState(false)

    const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] =
        useState(false)
    const [isSavingChanges, setIsSavingChanges] = useState(false)
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(
        null,
    )

    const isPreviewing = !isOptedIn && isPreviewingNewChat

    const runGuarded = useCallback(
        (action: () => void) => {
            if (isDirty) {
                setPendingAction(() => action)
                setIsUnsavedChangesModalOpen(true)
            } else {
                action()
            }
        },
        [isDirty],
    )

    const closeUnsavedChangesModal = useCallback(() => {
        setIsUnsavedChangesModalOpen(false)
        setPendingAction(null)
    }, [])

    const handleSaveAndContinue = useCallback(async () => {
        setIsSavingChanges(true)
        try {
            await onSaveChanges?.()
            setIsUnsavedChangesModalOpen(false)
            pendingAction?.()
            setPendingAction(null)
        } finally {
            setIsSavingChanges(false)
        }
    }, [onSaveChanges, pendingAction])

    const handleDiscardAndContinue = useCallback(() => {
        onDiscardChanges?.()
        setIsUnsavedChangesModalOpen(false)
        pendingAction?.()
        setPendingAction(null)
    }, [onDiscardChanges, pendingAction])

    const onConfirmSwitch = useCallback(async () => {
        setIsSwitching(true)
        try {
            // Persist any in-progress edits, then commit the opt-in. No
            // separate "save your changes?" step — switching saves directly.
            if (isDirty) {
                await onSaveChanges?.()
            }
            await setOptIn(true)
            logOptInConfirmed()
            setIsPreviewingNewChat(false)
            setIsModalOpen(false)
            toast.success("You're on the updated chat")
        } catch {
            // Keep the modal open so the user can retry.
            toast.error("Couldn't switch to the new chat. Please try again.")
        } finally {
            setIsSwitching(false)
        }
    }, [
        isDirty,
        onSaveChanges,
        setOptIn,
        setIsPreviewingNewChat,
        logOptInConfirmed,
    ])

    const openSwitchModal = useCallback(() => setIsModalOpen(true), [])

    const handleUnsavedModalOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isSavingChanges && !isOpen) closeUnsavedChangesModal()
        },
        [isSavingChanges, closeUnsavedChangesModal],
    )

    const handlePreviewNewChat = useCallback(
        () =>
            runGuarded(() => {
                setIsPreviewingNewChat(true)
                logPreviewModeSwitched({ from: 'old-chat', to: 'new-chat' })
            }),
        [runGuarded, setIsPreviewingNewChat, logPreviewModeSwitched],
    )

    const handleLeavePreview = useCallback(() => {
        onDiscardChanges?.()
        setIsPreviewingNewChat(false)
        logPreviewModeSwitched({ from: 'new-chat', to: 'old-chat' })
    }, [onDiscardChanges, setIsPreviewingNewChat, logPreviewModeSwitched])

    if (!shouldShowNonAiAgentChatSettingsRevamp) {
        return null
    }

    // Once opted in, the persistent control ("Switch to old chat") lives in the
    // settings header, so there is no inline banner.
    if (isOptedIn) {
        return null
    }

    return (
        <>
            <div
                className={`${css.banner} ${
                    isPreviewing ? css.bannerPreviewing : css.bannerDefault
                }`}
            >
                <div className={css.text}>
                    <Text variant="bold">
                        {isPreviewing
                            ? "You're previewing the new chat. Switch now?"
                            : 'A fresh look for chat'}
                    </Text>
                    <Text>
                        {isPreviewing
                            ? `Customers still see your current chat. Switch to the new chat below, and switch back anytime before ${cutoffDateLabel}.`
                            : `Preview and edit the refreshed settings and design before updating. Update now and switch back anytime before ${cutoffDateLabel}.`}
                    </Text>
                </div>
                <div>
                    {isPreviewing ? (
                        <Box gap="xs">
                            <Button
                                size={ButtonSize.Sm}
                                variant={ButtonVariant.Primary}
                                onClick={openSwitchModal}
                            >
                                Switch to new chat
                            </Button>
                            <Button
                                size={ButtonSize.Sm}
                                variant={ButtonVariant.Secondary}
                                onClick={handleLeavePreview}
                            >
                                Leave preview
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Button
                                size={ButtonSize.Sm}
                                variant={ButtonVariant.Primary}
                                onClick={handlePreviewNewChat}
                            >
                                Preview new chat
                            </Button>
                        </Box>
                    )}
                </div>
            </div>
            <ChatRedesignSwitchConfirmModal
                isOpen={isModalOpen}
                isOptedIn={false}
                isSubmitting={isSwitching}
                onConfirm={onConfirmSwitch}
                onOpenChange={setIsModalOpen}
            />
            <Modal
                size={ModalSize.Md}
                isOpen={isUnsavedChangesModalOpen}
                onOpenChange={handleUnsavedModalOpenChange}
            >
                <OverlayHeader title="Save your changes?" />
                <OverlayContent>
                    <Text>
                        You have unsaved changes. Save or discard them before
                        continuing.
                    </Text>
                </OverlayContent>
                <OverlayFooter hideCancelButton>
                    <Box gap="xs" justifyContent="flex-end">
                        <Button
                            intent={ButtonIntent.Regular}
                            size={ButtonSize.Md}
                            variant={ButtonVariant.Secondary}
                            isDisabled={isSavingChanges}
                            onClick={handleDiscardAndContinue}
                        >
                            Discard changes
                        </Button>
                        <Button
                            intent={ButtonIntent.Regular}
                            size={ButtonSize.Md}
                            variant={ButtonVariant.Primary}
                            isLoading={isSavingChanges}
                            onClick={handleSaveAndContinue}
                        >
                            Save &amp; continue
                        </Button>
                    </Box>
                </OverlayFooter>
            </Modal>
        </>
    )
}
