import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

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
        <Tooltip
            delay={0}
            trigger={
                <Button variant="tertiary" isDisabled leadingSlot="lock">
                    Edit
                </Button>
            }
        >
            <TooltipContent title="Snippets can't be edited" />
        </Tooltip>
        {!isPlaygroundOpen && <TestButton onTest={onTest} disabled={false} />}
    </>
)
