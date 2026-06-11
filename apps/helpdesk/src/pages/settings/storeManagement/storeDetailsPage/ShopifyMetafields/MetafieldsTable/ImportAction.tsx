import { Button } from '@gorgias/axiom'

interface ImportActionProps {
    onImportClick: () => void
}

export function ImportAction({ onImportClick }: ImportActionProps) {
    return (
        <Button size="sm" onClick={onImportClick} leadingSlot="add-plus">
            Import
        </Button>
    )
}
