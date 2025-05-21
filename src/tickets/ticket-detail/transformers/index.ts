import type { Transformer } from '../types'
import { aiMessageEventsTransformer } from './aiMessageEventsTransformer'
import { bareMessageTransformer } from './bareMessageTransformer'
import { eventTransformer } from './eventTransformer'
import { messageTransformer } from './messageTransformer'
import { signalMessagesTransformer } from './signalMessagesTransformer'

export const transformers: Transformer[] = [
    eventTransformer,
    messageTransformer,
    bareMessageTransformer,
    aiMessageEventsTransformer,
    signalMessagesTransformer,
]
