export enum PostStoreInstallationStepStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

export enum StepName {
    TRAIN = 'TRAIN',
    TEST = 'TEST',
    DEPLOY = 'DEPLOY',
    MONITOR = 'MONITOR',
    OPTIMIZE = 'OPTIMIZE',
    SCALE = 'SCALE',
    VERIFY_EMAIL_DOMAIN = 'VERIFY_EMAIL_DOMAIN',
    UPDATE_SHOPIFY_PERMISSIONS = 'UPDATE_SHOPIFY_PERMISSIONS',
    ENABLE_TRIGGER_ON_SEARCH = 'ENABLE_TRIGGER_ON_SEARCH',
    ENABLE_SUGGESTED_PRODUCTS = 'ENABLE_SUGGESTED_PRODUCTS',
    ENABLE_ASK_ANYTHING = 'ENABLE_ASK_ANYTHING',
    REVIEW_AI_AGENT_INTERACTIONS = 'REVIEW_AI_AGENT_INTERACTIONS',
    CREATE_AN_ACTION = 'CREATE_AN_ACTION',
    ENABLE_AI_AGENT_ON_CHAT = 'ENABLE_AI_AGENT_ON_CHAT',
    ENABLE_AI_AGENT_ON_EMAIL = 'ENABLE_AI_AGENT_ON_EMAIL',
}

export enum PostStoreInstallationStepType {
    POST_ONBOARDING = 'POST_ONBOARDING',
    POST_GO_LIVE = 'POST_GO_LIVE',
}

export type StepConfiguration = {
    stepName: StepName
    stepStartedDatetime: string | null
    stepCompletedDatetime: string | null
    stepDismissedDatetime: string | null
}

export type NotificationsConfiguration = {
    guidanceInactivityAcknowledgedAt: string | null
    deployInactivityAcknowledgedAt: string | null
}

export type PostStoreInstallationSteps = {
    id: string
    accountId: number
    shopName: string
    shopType: string
    status: PostStoreInstallationStepStatus
    type: PostStoreInstallationStepType
    stepsConfiguration: StepConfiguration[]
    notificationsConfiguration: NotificationsConfiguration | null
    createdDatetime: string
    updatedDatetime: string
    completedDatetime: string | null
}

export type CreatePostStoreInstallationStepPayload = Omit<
    PostStoreInstallationSteps,
    'id' | 'createdDatetime' | 'updatedDatetime'
>

export type GetPostStoreInstallationStepsParams = {
    accountId: number
    shopName: string
    shopType: string
}

export type UpdateStepRequest = {
    stepName: StepName
    stepStartedDatetime?: string | null
    stepCompletedDatetime?: string | null
    stepDismissedDatetime?: string | null
}

export type UpdateNotificationAcknowledgementRequest = {
    guidanceInactivityAcknowledgedAt?: string | null
    deployInactivityAcknowledgedAt?: string | null
}

export type PostStoreInstallationStepsResponse = {
    postStoreInstallationSteps: PostStoreInstallationSteps
}

export type GetPostStoreInstallationStepsResponse = {
    postStoreInstallationSteps: PostStoreInstallationSteps[]
}
