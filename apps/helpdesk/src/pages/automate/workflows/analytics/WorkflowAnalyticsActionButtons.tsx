import { Button, Tooltip } from '@gorgias/axiom'

interface Props {
    isDirty: boolean
    isTestDisabled: boolean
    onTest: (isTestable: boolean) => void
}

export const WorkflowAnalyticsActionButtons = ({
    isTestDisabled,
    isDirty,
    onTest,
}: Props) => {
    return (
        <>
            <Button
                onClick={() => onTest(!isDirty)}
                intent="secondary"
                isDisabled={isTestDisabled}
                id="test-disabled"
                leadingIcon="play_circle"
            >
                Test
            </Button>
            {isTestDisabled && (
                <Tooltip target="test-disabled">
                    Connect a Chat to this store to test and make sure it’s not
                    hidden. Testing is currently available for Chat only.
                </Tooltip>
            )}
            <Button isDisabled>Discard Changes</Button>
            <Button isDisabled>Publish</Button>
        </>
    )
}
