export enum ReportIssueOption {
    IncorrectLanguageUsed = 'incorrect_language',
    SignOffSignature = 'sign_off_signature',
    ToneOfVoice = 'tone_of_voice',
    TooVerbose = 'too_verbose',
    LackOfEmpathy = 'lack_of_empathy',
    OverPromising = 'over_promising',
    MentionsActionNotPerformed = 'mentions_action_not_performed',
    AsksContactSupport = 'asks_contact_support',
    RespondedToHandoverTopic = 'responded_to_handover_topic',
}

export const ReportIssueLabels = {
    [ReportIssueOption.IncorrectLanguageUsed]: 'Incorrect Language Used',
    [ReportIssueOption.SignOffSignature]: 'Sign off/signature',
    [ReportIssueOption.ToneOfVoice]: 'Tone of voice',
    [ReportIssueOption.TooVerbose]: 'Too verbose',
    [ReportIssueOption.LackOfEmpathy]: 'Lack of empathy',
    [ReportIssueOption.OverPromising]: 'Over promising',
    [ReportIssueOption.MentionsActionNotPerformed]:
        'Mentions an action it didn’t perform',
    [ReportIssueOption.AsksContactSupport]: 'Asks customer to contact support',
    [ReportIssueOption.RespondedToHandoverTopic]: 'Responded to handover topic',
}
