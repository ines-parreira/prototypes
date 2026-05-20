import { Modal, OverlayHeader } from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
}

export const SkillPerformanceTrendModal = ({ isOpen, onOpenChange }: Props) => (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <OverlayHeader title="Skill performance" />
    </Modal>
)
