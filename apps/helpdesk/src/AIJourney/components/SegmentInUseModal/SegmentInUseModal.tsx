import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export const SegmentInUseModal = ({ isOpen, onClose }: Props) => {
    return (
        <Modal size="sm" isOpen={isOpen} isDismissable onOpenChange={onClose}>
            <OverlayHeader title="This segment can't be deleted" />
            <OverlayContent>
                <Text color="var(--content-neutral-secondary)">
                    It&apos;s currently used in campaigns that are scheduled,
                    active, or paused. You need to remove this segment from
                    those campaigns before deleting it.
                </Text>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box width="100%" justifyContent="flex-end">
                    <Button variant="primary" onClick={onClose}>
                        Got it
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
