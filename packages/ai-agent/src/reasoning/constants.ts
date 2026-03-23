export enum AiAgentMessageType {
    WAIT_FOR_CLOSE_TICKET_CONFIRMATION = 'wait_for_close_ticket_confirmation',
    WAIT_FOR_CUSTOMER_RESPONSE = 'wait_for_customer_response',
    HANDOVER_TO_AGENT = 'handover_to_agent',
    GREETING = 'ai_agent_greeting',
    AI_AGENT_RESPONSE_RELEVANT_TRUE = 'ai_agent_response_relevant_true',
    AI_AGENT_RESPONSE_RELEVANT_FALSE = 'ai_agent_response_relevant_false',
    ERROR = 'error',
    ENTRY_CUSTOMER_MESSAGE = 'entry_customer_message',
    REQUEST_CUSTOMER_AUTHENTICATION = 'request_customer_authentication',
}

export type AiAgentReasoningState =
    | 'loading'
    | 'collapsed'
    | 'expanded'
    | 'error'
    | 'static'
