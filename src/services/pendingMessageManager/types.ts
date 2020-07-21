import type {NewMessage} from '../../state/newMessage/types'

export type SendMessageArgs = [
    string,
    NewMessage,
    Maybe<string>,
    boolean,
    Maybe<string>
]
