import {
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'

export const mockPostStoreInstallationStep = {
    id: 'test-id-123',
    accountId: 100,
    shopName: 'test-shop',
    shopType: 'shopify',
    status: PostStoreInstallationStepStatus.NOT_STARTED,
    type: PostStoreInstallationStepType.POST_ONBOARDING,
    stepsConfiguration: [
        {
            stepName: StepName.TRAIN,
            stepStartedDatetime: null,
            stepCompletedDatetime: null,
            stepDismissedDatetime: null,
        },
        {
            stepName: StepName.TEST,
            stepStartedDatetime: null,
            stepCompletedDatetime: null,
            stepDismissedDatetime: null,
        },
        {
            stepName: StepName.DEPLOY,
            stepStartedDatetime: null,
            stepCompletedDatetime: null,
            stepDismissedDatetime: null,
        },
    ],
    notificationsConfiguration: {
        guidanceInactivityAcknowledgedAt: null,
        deployInactivityAcknowledgedAt: null,
    },
    completedDatetime: null,
    createdDatetime: '2024-01-01T00:00:00Z',
    updatedDatetime: '2024-01-01T00:00:00Z',
}
