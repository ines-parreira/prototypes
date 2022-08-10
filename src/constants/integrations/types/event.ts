export enum PhoneIntegrationEvent {
    IncomingPhoneCall = 'incoming-phone-call',
    OutgoingPhoneCall = 'outgoing-phone-call',
    CompletedPhoneCall = 'completed-phone-call',
    CallRecording = 'call-recording',
    MissedPhoneCall = 'missed-phone-call',
    VoicemailRecording = 'voicemail-recording',
    PhoneCallAnswered = 'phone-call-answered',
    ConversationStarted = 'phone-call-conversation-started',
    PhoneCallForwardedToExternalNumber = 'phone-call-forwarded-to-external-number',
    PhoneCallForwardedToGorgiasNumber = 'phone-call-forwarded-to-gorgias-number',
    PhoneCallForwarded = 'phone-call-forwarded',
    MessagePlayed = 'message-played',
}
