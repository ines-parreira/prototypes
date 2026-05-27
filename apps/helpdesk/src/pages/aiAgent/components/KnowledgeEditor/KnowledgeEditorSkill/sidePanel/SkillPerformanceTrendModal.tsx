import { Modal, OverlayContent, OverlayHeader } from '@gorgias/axiom'

import { SkillPerformanceChart } from './SkillPerformanceChart'

type Props = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
}

export const SkillPerformanceTrendModal = ({ isOpen, onOpenChange }: Props) => (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <OverlayHeader title="Skill performance" />
        <OverlayContent>
            <SkillPerformanceChart />
        </OverlayContent>
    </Modal>
)
