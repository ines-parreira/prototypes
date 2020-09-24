import {NewMessage} from '../../state/newMessage/types'

export type SendMessageArgs = [
    number,
    NewMessage,
    Maybe<string>,
    boolean,
    Maybe<string>
]
