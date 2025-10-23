export enum VoiceFlowNodeType {
    CustomerLookup = 'customer_fields_conditional',
    CustomerLookupOption = 'customer_fields_conditional_option',
    IncomingCall = 'incoming_call',
    EndCall = 'end_call',
    PlayMessage = 'play_message',
    Enqueue = 'enqueue',
    EnqueueOption = 'enqueue_option',
    RouteToInternalNumber = 'route_to_internal_number',
    SendToVoicemail = 'send_to_voicemail',
    TimeSplitConditional = 'time_split_conditional',
    TimeSplitOption = 'time_split_option',
    IvrMenu = 'ivr_menu',
    IvrOption = 'ivr_option',
    SendToSMS = 'send_to_sms',
    Intermediary = 'intermediary',
    ForwardToExternalNumber = 'forward_to_external_number',
}

export const INCOMING_CALL_NODE = {
    id: VoiceFlowNodeType.IncomingCall,
    type: VoiceFlowNodeType.IncomingCall,
    data: {},
}

export const END_CALL_NODE = {
    id: VoiceFlowNodeType.EndCall,
    type: VoiceFlowNodeType.EndCall,
    data: {},
}

export const FINAL_NODES_TYPES = [
    VoiceFlowNodeType.SendToVoicemail,
    VoiceFlowNodeType.SendToSMS,
]
