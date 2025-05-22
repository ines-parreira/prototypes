import type { Transformer } from '../types'
import { aiMessageEventsTransformer } from './aiMessageEventsTransformer'
import { eventTransformer } from './eventTransformer'
import { messageTransformer } from './messageTransformer'
import { minimalMessageTransformer } from './minimalMessageTransformer'
import { signalMessagesTransformer } from './signalMessagesTransformer'

export const transformers: Transformer[] = [
    eventTransformer,
    messageTransformer,
    minimalMessageTransformer,
    aiMessageEventsTransformer,
    signalMessagesTransformer,
]
