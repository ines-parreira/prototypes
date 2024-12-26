export enum SettingsBannerType {
    Email = 'email',
    Chat = 'chat',
}

export const BannerText = {
    [SettingsBannerType.Email]:
        'When AI Agent is enabled on Email, Autoresponders will be disabled to avoid conflicting responses.',
    [SettingsBannerType.Chat]:
        'When AI Agent is enabled on Chat, Article recommendation will be disabled to avoid conflicting responses.',
}
