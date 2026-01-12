import { Button } from '@gorgias/axiom'

import { TestButton } from './KnowledgeEditorTopBarCommonControls'

type Props = {
    onTest: () => void
    isPlaygroundOpen?: boolean
}

export const KnowledgeEditorTopBarSnippetControls = ({
    onTest,
    isPlaygroundOpen = false,
}: Props) => (
    <>
        <Button variant="secondary" isDisabled leadingSlot="lock">
            Edit
        </Button>
        {!isPlaygroundOpen && <TestButton onTest={onTest} disabled={false} />}
    </>
)
