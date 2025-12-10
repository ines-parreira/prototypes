import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import type { LocaleCode } from 'models/helpCenter/types'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'

type Props = {
    isOpen: boolean
    guidanceHelpCenterId: number
    guidanceArticleId: number
    locale: LocaleCode
    onClose: () => void
    onDiscardSucceeded: () => void
    onDiscardFailed?: () => void
}

export const KnowledgeEditorGuidanceDiscardDraftModal = ({
    isOpen,
    guidanceHelpCenterId,
    guidanceArticleId,
    locale,
    onClose,
    onDiscardSucceeded,
    onDiscardFailed,
}: Props) => {
    const { discardGuidanceDraft, isDiscardingDraft } =
        useGuidanceArticleMutation({ guidanceHelpCenterId })

    const handleDiscard = async () => {
        try {
            await discardGuidanceDraft(guidanceArticleId, locale)
            onDiscardSucceeded()
        } catch {
            onDiscardFailed?.()
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <OverlayHeader title="Discard draft?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        Your draft will be permanently deleted, this content
                        can&apos;t be restored.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Button
                    variant="secondary"
                    onClick={onClose}
                    isDisabled={isDiscardingDraft}
                >
                    Back to editing
                </Button>
                <Button
                    variant="primary"
                    intent="destructive"
                    onClick={handleDiscard}
                    isLoading={isDiscardingDraft}
                >
                    Discard draft
                </Button>
            </OverlayFooter>
        </Modal>
    )
}
