import {Node} from 'reactflow'
import {ProductCardAttachment} from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'

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
                attachments?: ProductCardAttachment[] | null
            }
        }
        shouldShowErrors?: Maybe<boolean>
        isGreyedOut?: Maybe<boolean>
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
        shouldShowErrors?: Maybe<boolean>
        isGreyedOut?: Maybe<boolean>
    },
    'reply_button'
>

export type VisualBuilderNode =
    | TriggerButtonNodeType
    | AutomatedMessageNodeType
    | ReplyButtonNodeType
