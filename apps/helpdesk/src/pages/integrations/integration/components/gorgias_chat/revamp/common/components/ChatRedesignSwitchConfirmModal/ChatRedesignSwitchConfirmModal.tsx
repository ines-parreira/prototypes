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
} from '@gorgias/axiom'

import { useChatRedesignCutoffDate } from 'pages/integrations/integration/components/gorgias_chat/revamp/common/hooks/useChatRedesignCutoffDate'

type Props = {
    isOpen: boolean
    /**
     * When true, confirms switching back to the old chat (opt-out). When false,
     * confirms switching to the new chat (opt-in).
     */
    isOptedIn: boolean
    isSubmitting: boolean
    onConfirm: () => void
    onOpenChange: (isOpen: boolean) => void
}

/**
 * Confirmation modal shared by every chat redesign switch flow — the opt-in
 * banner and list "Update to new chat" action, and the settings header
 * "Switch to old chat" — so all of them stay in sync.
 */
export const ChatRedesignSwitchConfirmModal = ({
    isOpen,
    isOptedIn,
    isSubmitting,
    onConfirm,
    onOpenChange,
}: Props) => {
    const { cutoffDateLabel } = useChatRedesignCutoffDate()

    return (
        <Modal
            size={ModalSize.Md}
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!isSubmitting) onOpenChange(open)
            }}
        >
            <OverlayHeader
                title={
                    isOptedIn
                        ? 'Switch back to the old chat?'
                        : 'Switch to new chat'
                }
            />
            <OverlayContent>
                <Text>
                    {isOptedIn
                        ? `Switch anytime before ${cutoffDateLabel}. Changes can take up to 30 minutes to appear across your store.`
                        : 'Changes can take up to 30 minutes to appear across your store.'}
                </Text>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end">
                    <Button
                        intent={ButtonIntent.Regular}
                        size={ButtonSize.Md}
                        variant={ButtonVariant.Secondary}
                        isDisabled={isSubmitting}
                        onClick={() => onOpenChange(false)}
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
                        Switch
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
