import { Button } from '@gorgias/axiom'

type SectionToggleButtonProps = {
    isExpanded: boolean
    onToggle: () => void
    sectionLabel: string
}

export function SectionToggleButton({
    isExpanded,
    onToggle,
    sectionLabel,
}: SectionToggleButtonProps) {
    return (
        <Button
            as="button"
            icon={isExpanded ? 'arrow-chevron-up' : 'arrow-chevron-down'}
            variant="tertiary"
            size="md"
            aria-expanded={isExpanded}
            aria-label={
                isExpanded
                    ? `Collapse ${sectionLabel}`
                    : `Expand ${sectionLabel}`
            }
            onClick={(e) => {
                e.stopPropagation()
                onToggle()
            }}
        />
    )
}
