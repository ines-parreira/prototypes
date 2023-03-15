import {Node} from 'reactflow'

export type TriggerButtonNodeType = Node<
    {
        entrypoint_label: string
    },
    'trigger_button'
>

export type VisualBuilderNode = TriggerButtonNodeType
