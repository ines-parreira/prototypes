export enum VoiceFlowNodeType {
    IncomingCall = 'incoming_call',
    EndCall = 'end_call',
    PlayMessage = 'play_message',
    Enqueue = 'enqueue',
    SendToVoicemail = 'send_to_voicemail',
    TimeSplitConditional = 'time_split_conditional',
    TimeSplitOption = 'time_split_option',
    IvrMenu = 'ivr_menu',
    IvrOption = 'ivr_option',
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
