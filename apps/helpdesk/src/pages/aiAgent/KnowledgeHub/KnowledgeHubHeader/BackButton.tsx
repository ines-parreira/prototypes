import { Button } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

type BackButtonProps = {
    onBack: () => void
    data: GroupedKnowledgeItem | null
}

export const BackButton = ({ data, onBack }: BackButtonProps) => {
    if (!data) {
        return null
    }
    return (
        <Button
            onClick={onBack}
            aria-label="Back to Knowledge Hub"
            variant="secondary"
            icon="arrow-chevron-left"
        />
    )
}
