import {Tooltip} from '@gorgias/ui-kit'
import React from 'react'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

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
            >
                <ButtonIconLabel icon="play_circle" position="left">
                    Test
                </ButtonIconLabel>
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
