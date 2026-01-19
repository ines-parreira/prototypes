import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

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
        <Tooltip delay={0}>
            <TooltipTrigger>
                <Button variant="tertiary" isDisabled leadingSlot="lock">
                    Edit
                </Button>
            </TooltipTrigger>
            <TooltipContent caption="Snippets can't be edited" />
        </Tooltip>
        {!isPlaygroundOpen && <TestButton onTest={onTest} disabled={false} />}
    </>
)
