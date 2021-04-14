export enum TicketAuditLogEvent {
    RuleExecuted = 'rule-executed',
    TicketAssigned = 'ticket-assigned',
    TicketClosed = 'ticket-closed',
    TicketCreated = 'ticket-created',
    TicketCustomerUpdated = 'ticket-customer-updated',
    TicketMarkedSpam = 'ticket-marked-spam',
    TicketMerged = 'ticket-merged',
    TicketMessageCreated = 'ticket-message-created',
    TicketReopened = 'ticket-reopened',
    TicketSnoozed = 'ticket-snoozed',
    TicketTagsAdded = 'ticket-tags-added',
    TicketTagsRemoved = 'ticket-tags-removed',
    TicketTeamAssigned = 'ticket-team-assigned',
    TicketTeamUnassigned = 'ticket-team-unassigned',
    TicketTrashed = 'ticket-trashed',
    TicketUnassigned = 'ticket-unassigned',
    TicketUnmarkedSpam = 'ticket-unmarked-spam',
    TicketUntrashed = 'ticket-untrashed',
    TicketUpdated = 'ticket-updated',
}

export enum PhoneIntegrationEvent {
    IncomingPhoneCall = 'incoming-phone-call',
    OutgoingPhoneCall = 'outgoing-phone-call',
    CompletedPhoneCall = 'completed-phone-call',
    MissedPhoneCall = 'missed-phone-call',
    VoicemailRecording = 'voicemail-recording',
}
