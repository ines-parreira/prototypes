import { useCallback, useState } from 'react'

import { fromJS } from 'immutable'
import type { Map } from 'immutable'

import {
    Box,
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Icon,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { usePageTopBanner } from 'pages/common/hooks/usePageTopBanner'
import { useChatPreviewPanelContext } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel'
import { useChatRedesignOptIn } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignOptIn'
import { useShouldShowChatSettingsRevamp } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useShouldShowChatSettingsRevamp'
import { useStoreIntegration } from 'pages/integrations/integration/hooks/useStoreIntegration'
import { updateOrCreateIntegration } from 'state/integrations/actions'

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
    const dispatch = useAppDispatch()
    const { storeIntegration } = useStoreIntegration(integration)
    const { warpToPageTopBanner } = usePageTopBanner()

    const { shouldShowNonAiAgentChatSettingsRevamp } =
        useShouldShowChatSettingsRevamp(storeIntegration, integration.get('id'))

    const { isOptedIn } = useChatRedesignOptIn(integration.get('id'))
    const { isPreviewingNewChat, setIsPreviewingNewChat } =
        useChatPreviewPanelContext()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    const onConfirm = useCallback(async () => {
        setIsSubmitting(true)
        const originalMeta = integration.get('meta')?.toJS() ?? {}
        const nextOptInDatetime = isOptedIn ? null : new Date().toISOString()
        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: {
                ...originalMeta,
                chat_redesign_opt_in_datetime: nextOptInDatetime,
            },
        }
        try {
            await dispatch(updateOrCreateIntegration(fromJS(form)))
            if (!isOptedIn) {
                setIsPreviewingNewChat(false)
            }
            setIsModalOpen(false)
        } finally {
            setIsSubmitting(false)
        }
    }, [dispatch, integration, isOptedIn, setIsPreviewingNewChat])

    if (!shouldShowNonAiAgentChatSettingsRevamp) {
        return null
    }

    const title = isOptedIn
        ? "You're on the updated chat"
        : isPreviewing
          ? "You're previewing the new chat"
          : 'A fresh look for chat'

    const description = isOptedIn
        ? 'Switch back to the old chat anytime before July 27.'
        : isPreviewing
          ? 'Publish to make it live for your customers, or revert to keep the current chat.'
          : "Preview the new chat experience, then publish when you're ready."

    return warpToPageTopBanner(
        <>
            <div className={css.banner}>
                <div className={css.content}>
                    <Icon
                        name={isOptedIn ? 'check-circle' : 'chat-circle'}
                        color="#6e3ad3"
                    />
                    <div className={css.text}>
                        <Text variant="bold">{title}</Text>
                        <Text>{description}</Text>
                    </div>
                </div>
                {isOptedIn ? (
                    <Button
                        size={ButtonSize.Sm}
                        variant={ButtonVariant.Secondary}
                        onClick={() => runGuarded(() => setIsModalOpen(true))}
                    >
                        Switch back
                    </Button>
                ) : isPreviewing ? (
                    <Box gap="xs">
                        <Button
                            size={ButtonSize.Sm}
                            variant={ButtonVariant.Secondary}
                            onClick={() =>
                                runGuarded(() => setIsPreviewingNewChat(false))
                            }
                        >
                            Revert
                        </Button>
                        <Button
                            size={ButtonSize.Sm}
                            variant={ButtonVariant.Primary}
                            onClick={() =>
                                runGuarded(() => setIsModalOpen(true))
                            }
                        >
                            Publish
                        </Button>
                    </Box>
                ) : (
                    <Button
                        size={ButtonSize.Sm}
                        variant={ButtonVariant.Primary}
                        onClick={() =>
                            runGuarded(() => setIsPreviewingNewChat(true))
                        }
                    >
                        Preview
                    </Button>
                )}
            </div>
            <Modal
                size={ModalSize.Md}
                isOpen={isModalOpen}
                onOpenChange={(isOpen) => {
                    if (!isSubmitting) setIsModalOpen(isOpen)
                }}
            >
                <OverlayHeader
                    title={
                        isOptedIn
                            ? 'Switch back to the old chat?'
                            : 'Publish the new chat?'
                    }
                />
                <OverlayContent>
                    <Text>
                        {isOptedIn
                            ? 'Switch anytime before July 27. Changes can take up to 30 minutes to appear across your store.'
                            : 'This makes the new chat live for your customers. Changes can take up to 30 minutes to appear across your store.'}
                    </Text>
                </OverlayContent>
                <OverlayFooter hideCancelButton>
                    <Box gap="xs" justifyContent="flex-end">
                        <Button
                            intent={ButtonIntent.Regular}
                            size={ButtonSize.Md}
                            variant={ButtonVariant.Secondary}
                            isDisabled={isSubmitting}
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            intent={ButtonIntent.Regular}
                            size={ButtonSize.Md}
                            variant={ButtonVariant.Primary}
                            isLoading={isSubmitting}
                            onClick={onConfirm}
                        >
                            {isOptedIn ? 'Switch back' : 'Publish'}
                        </Button>
                    </Box>
                </OverlayFooter>
            </Modal>
            <Modal
                size={ModalSize.Md}
                isOpen={isUnsavedChangesModalOpen}
                onOpenChange={(isOpen) => {
                    if (!isSavingChanges && !isOpen) closeUnsavedChangesModal()
                }}
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
        </>,
    )
}
