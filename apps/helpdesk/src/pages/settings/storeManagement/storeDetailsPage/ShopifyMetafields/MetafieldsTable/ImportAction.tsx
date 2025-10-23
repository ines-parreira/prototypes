import { Button } from '@gorgias/axiom'

export default function ImportAction() {
    return (
        <Button
            size="sm"
            onClick={() => {
                confirm(`TODO`)
            }}
            leadingSlot="add-plus"
        >
            Import
        </Button>
    )
}
