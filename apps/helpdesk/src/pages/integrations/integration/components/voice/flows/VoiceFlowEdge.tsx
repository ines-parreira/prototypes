import { ComponentProps, useMemo } from 'react'

import { noop } from 'lodash'

import { AddStepMenuItem } from 'core/ui/flows'
import { CustomEdge } from 'core/ui/flows/components/CustomEdge'

import { useVoiceFlow } from './useVoiceFlow'
import { canAddNewStepOnEdge } from './utils'

type Props = Omit<ComponentProps<typeof CustomEdge>, 'children'>

export function VoiceFlowEdge(props: Props) {
    const { source } = props
    const { getNode } = useVoiceFlow()

    const isButtonEdge = useMemo(() => {
        const sourceNode = getNode(source)

        return sourceNode && canAddNewStepOnEdge(sourceNode)
    }, [getNode, source])

    return (
        <CustomEdge {...props}>
            {isButtonEdge && (
                <AddStepMenuItem label="Add step" onClick={noop} />
            )}
        </CustomEdge>
    )
}
