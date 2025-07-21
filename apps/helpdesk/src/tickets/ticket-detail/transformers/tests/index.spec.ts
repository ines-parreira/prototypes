import { aiInternalMessageTransformer } from '../aiInternalMessageTransformer'
import { aiMessageEventsTransformer } from '../aiMessageEventsTransformer'
import { aiMessageTransformer } from '../aiMessageTransformer'
import { eventTransformer } from '../eventTransformer'
import { failedMessageTransformer } from '../failedMessageTransformer'
import { transformers } from '../index'
import { messageTransformer } from '../messageTransformer'
import { minimalMessageTransformer } from '../minimalMessageTransformer'
import { phoneEventTransformer } from '../phoneEventTransformer'
import { signalMessagesTransformer } from '../signalMessagesTransformer'

describe('transformers', () => {
    it('should export transformers in the correct order', () => {
        const expectedTransformers = [
            phoneEventTransformer,
            eventTransformer,
            messageTransformer,
            minimalMessageTransformer,
            aiMessageTransformer,
            aiMessageEventsTransformer,
            aiInternalMessageTransformer,
            signalMessagesTransformer,
            failedMessageTransformer,
        ]

        expect(transformers).toEqual(expectedTransformers)
    })
})
