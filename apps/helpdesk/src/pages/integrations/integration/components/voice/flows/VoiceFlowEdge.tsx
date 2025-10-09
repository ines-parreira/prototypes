import { ComponentProps, useMemo } from 'react'

import { CustomEdge } from 'core/ui/flows/components/CustomEdge'

import AddStepMenuContent from './AddStepMenuContent'
import { useVoiceFlow } from './useVoiceFlow'
import { canAddNewStepOnEdge } from './utils'

type Props = Omit<ComponentProps<typeof CustomEdge>, 'children'> & {
    isDisabled?: boolean
}

export function VoiceFlowEdge(props: Props) {
    const { source, target, isDisabled } = props
    const { getNode } = useVoiceFlow()

    const isButtonEdge = useMemo(() => {
        const sourceNode = getNode(source)
        const targetNode = getNode(target)

        return (
            sourceNode &&
            targetNode &&
            canAddNewStepOnEdge(sourceNode, targetNode)
        )
    }, [getNode, source, target])

    return (
        <CustomEdge {...props} isDisabled={isDisabled}>
            {isButtonEdge && (
                <AddStepMenuContent source={source} target={target} />
            )}
        </CustomEdge>
    )
}

export function VoiceFlowPreviewEdge(props: Props) {
    return <VoiceFlowEdge {...props} isDisabled={true} />
}
