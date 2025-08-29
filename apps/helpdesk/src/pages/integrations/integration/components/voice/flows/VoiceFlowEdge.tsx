import { ComponentProps, useMemo } from 'react'

import { CustomEdge } from 'core/ui/flows/components/CustomEdge'

import AddStepMenuContent from './AddStepMenuContent'
import { useVoiceFlow } from './useVoiceFlow'
import { canAddNewStepOnEdge } from './utils'

type Props = Omit<ComponentProps<typeof CustomEdge>, 'children'>

export function VoiceFlowEdge(props: Props) {
    const { source, target } = props
    const { getNode } = useVoiceFlow()

    const isButtonEdge = useMemo(() => {
        const sourceNode = getNode(source)

        return sourceNode && canAddNewStepOnEdge(sourceNode)
    }, [getNode, source])

    return (
        <CustomEdge {...props}>
            {isButtonEdge && (
                <AddStepMenuContent source={source} target={target} />
            )}
        </CustomEdge>
    )
}
