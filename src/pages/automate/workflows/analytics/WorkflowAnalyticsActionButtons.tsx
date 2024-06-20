import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Tooltip from 'pages/common/components/Tooltip'
import {FeatureFlagKey} from 'config/featureFlags'

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
    const isPreviewTestButtonVisible =
        useFlags()[FeatureFlagKey.FlowsPreviewTestButton]

    return (
        <>
            {isPreviewTestButtonVisible && (
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
            )}
            {isPreviewTestButtonVisible && isTestDisabled && (
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
