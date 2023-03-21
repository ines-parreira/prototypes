import {Node} from 'reactflow'

export type TriggerButtonNodeType = Node<
    {
        entrypoint_label: string
        shouldShowErrors?: boolean
    },
    'trigger_button'
>

export type AutomatedMessageNodeType = Node<
    {
        step_id: string
        message: {
            content: {
                html: string
                text: string
            }
        }
        shouldShowErrors?: boolean
    },
    'automated_message'
>

export type ReplyButtonNodeType = Node<
    {
        step_id: string
        choice: {
            label: string
            event_id: string
        }
        shouldShowErrors?: boolean
    },
    'reply_button'
>

export type VisualBuilderNode =
    | TriggerButtonNodeType
    | AutomatedMessageNodeType
    | ReplyButtonNodeType
