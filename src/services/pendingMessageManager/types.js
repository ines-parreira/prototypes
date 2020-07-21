//@flow
import type {NewMessageType} from '../../state/newMessage/types'

export type SendMessageArgs = [
    string,
    NewMessageType,
    ?string,
    boolean,
    ?string
]
