import type { Transformer } from '../types'
import { aiMessageEventsTransformer } from './aiMessageEventsTransformer'
import { aiMessageTransformer } from './aiMessageTransformer'
import { eventTransformer } from './eventTransformer'
import { failedMessageTransformer } from './failedMessageTransformer'
import { messageTransformer } from './messageTransformer'
import { minimalMessageTransformer } from './minimalMessageTransformer'
import { phoneEventTransformer } from './phoneEventTransformer'
import { signalMessagesTransformer } from './signalMessagesTransformer'

export const transformers: Transformer[] = [
    phoneEventTransformer,
    eventTransformer,
    messageTransformer,
    minimalMessageTransformer,
    aiMessageTransformer,
    aiMessageEventsTransformer,
    signalMessagesTransformer,
    failedMessageTransformer,
]
