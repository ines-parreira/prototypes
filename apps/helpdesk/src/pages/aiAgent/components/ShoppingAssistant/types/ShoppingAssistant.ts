export enum PromoCardVariant {
    AdminTrial = 'admin-trial',
    AdminDemo = 'admin-demo',
    LeadNotify = 'lead-notify',
    AdminTrialProgress = 'admin-trial-progress',
    LeadTrialProgress = 'lead-trial-progress',
    Hidden = 'hidden',
}

export enum ShoppingAssistantEventType {
    StartTrial = 'Start Trial',
    Demo = 'Demo',
    Learn = 'Learn',
    NotifyAdmin = 'Notify Admin',
}

export interface ButtonConfig {
    label: string
    href?: string
    target?: string
    onClick?: () => void
    disabled?: boolean
}

export interface PromoCardContent {
    variant: PromoCardVariant
    title: string
    description: string
    shouldShowDescriptionIcon: boolean
    showVideo: boolean
    shouldShowNotificationIcon: boolean
    primaryButton: ButtonConfig
    secondaryButton?: ButtonConfig
    videoModalButton?: ButtonConfig
    showProgressBar?: boolean
    progressPercentage?: number
    progressText?: string
}
