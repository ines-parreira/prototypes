export enum ReportIssueOption {
    ToneOfVoice = 'tone_of_voice',
    IncorrectLanguageUsed = 'incorrect_language',
    CustomerName = 'customer_name',
    SignOffSignature = 'sign_off_signature',
    ContainedTypo = 'contained_typo',
    TooVerbose = 'too_verbose',
    LackOfEmpathy = 'lack_of_empathy',
    OverPromising = 'over_promising',
    MentionsActionNotPerformed = 'mentions_action_not_performed',
    AsksContactSupport = 'asks_contact_support',
    RespondedToHandoverTopic = 'responded_to_handover_topic',
    DidNotRespondWhenItShouldHave = 'did_not_respond_when_it_should_have',
}

export const ReportIssueLabels = {
    [ReportIssueOption.ToneOfVoice]: 'Wrong Tone of voice Used',
    [ReportIssueOption.IncorrectLanguageUsed]: 'Wrong Language Used',
    [ReportIssueOption.CustomerName]: 'Wrong customer name Used',
    [ReportIssueOption.SignOffSignature]: 'Wrong Sign off/signature Used',
    [ReportIssueOption.ContainedTypo]: 'Contained a Typo',
    [ReportIssueOption.TooVerbose]: 'Response was too verbose',
    [ReportIssueOption.LackOfEmpathy]: 'Lacked empathy',
    [ReportIssueOption.OverPromising]: 'Over promised',
    [ReportIssueOption.MentionsActionNotPerformed]:
        'Mentioned an action it didn’t perform',
    [ReportIssueOption.AsksContactSupport]: 'Asked customer to contact support',
    [ReportIssueOption.RespondedToHandoverTopic]: 'Responded to handover topic',
    [ReportIssueOption.DidNotRespondWhenItShouldHave]:
        'Did not respond when it should have',
}
