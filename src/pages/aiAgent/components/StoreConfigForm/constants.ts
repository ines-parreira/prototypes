export enum SettingsBannerType {
    Email = 'email',
    Chat = 'chat',
    Sms = 'sms',
}

export const BannerText = {
    [SettingsBannerType.Email]:
        'When AI Agent is enabled on Email, Autoresponders will be disabled to avoid conflicting responses.',
    [SettingsBannerType.Chat]:
        'When AI Agent is enabled on Chat, Article recommendation will be disabled to avoid conflicting responses.',
    [SettingsBannerType.Sms]:
        '🚨 At the moment SMS channel is only available for AI Journey scenarios and admin usage.',
}
