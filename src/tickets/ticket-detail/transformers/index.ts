import type { Transformer } from '../types'
import { aiMessageEventsTransformer } from './aiMessageEventsTransformer'
import { eventTransformer } from './eventTransformer'
import { messageTransformer } from './messageTransformer'
import { minimalMessageTransformer } from './minimalMessageTransformer'
import { phoneEventTransformer } from './phoneEventTransformer'
import { signalMessagesTransformer } from './signalMessagesTransformer'

export const transformers: Transformer[] = [
    phoneEventTransformer,
    eventTransformer,
    messageTransformer,
    minimalMessageTransformer,
    aiMessageEventsTransformer,
    signalMessagesTransformer,
]
