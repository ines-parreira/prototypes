import {AiAgentResponse, TicketOutcome} from 'models/aiAgentPlayground/types'

export const getSubmitPlaygroundTicketResponseFixture = (
    props?: Partial<AiAgentResponse>
): AiAgentResponse => ({
    generate: {
        output: {
            generated_message: 'message',
            outcome: TicketOutcome.CLOSE,
        },
    },
    qa: {
        output: {
            validate_outcome: true,
            validate_generated_message: true,
        },
    },
    postProcessing: {
        internalNote: '',
        htmlReply: null,
    },
    _action_serialized_state: null,
    ...props,
})
