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
            signalMessagesTransformer,
            failedMessageTransformer,
        ]

        expect(transformers).toEqual(expectedTransformers)
    })

    it('should have the correct number of transformers', () => {
        expect(transformers).toHaveLength(8)
    })
})
