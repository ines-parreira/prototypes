import type React from 'react'

import {
    Box,
    Button,
    Image,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
} from '@gorgias/axiom'

type Props = {
    icon?: string
    gif?: string
    buttonLabel: string
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
}

const SuccessModal: React.FC<Props> = ({
    icon,
    buttonLabel,
    isOpen,
    onClose,
    children,
}) => (
    <Modal isOpen={isOpen} size="sm" onOpenChange={onClose}>
        <OverlayHeader />
        <OverlayContent
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="md"
        >
            {icon && (
                <Image
                    alt="success icon"
                    src={icon}
                    width={48}
                    fallback={undefined}
                />
            )}
            <Box flexDirection="column" gap="md" alignItems="center">
                {children}
            </Box>
            <Button onClick={onClose}>{buttonLabel}</Button>
        </OverlayContent>
        <OverlayFooter hideCancelButton />
    </Modal>
)

export default SuccessModal
