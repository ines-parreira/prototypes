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
