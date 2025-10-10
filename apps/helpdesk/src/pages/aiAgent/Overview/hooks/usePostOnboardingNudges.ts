import useAppSelector from 'hooks/useAppSelector'
import {
    useGetPostStoreInstallationStepsPure,
    useUpdateStepNotificationsPure,
} from 'models/aiAgentPostStoreInstallationSteps/queries'
import {
    PostStoreInstallationStepStatus,
    PostStoreInstallationStepType,
    StepName,
} from 'models/aiAgentPostStoreInstallationSteps/types'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

const INACTIVITY_THRESHOLD_DAYS = 3
const MILLISECONDS_TO_DAYS = 1000 * 60 * 60 * 24

const DEFAULT_POST_ONBOARDING_NUDGES = {
    shouldDisplayTrainNudge: false,
    shouldDisplayDeployNudge: false,
    dismissTrainNudge: async () => {},
    dismissDeployNudge: async () => {},
    isLoading: false,
}

/**
 * Hook that determines if train or deploy nudges should be displayed
 * based on post-store installation steps and inactivity thresholds
 */
export const usePostOnboardingNudges = (shopName: string, shopType: string) => {
    const currentAccountId = useAppSelector(getCurrentAccountId)

    const user = useAppSelector(getCurrentUser)
    const isTeamLeadOrAdmin = isTeamLead(user)

    const { data, isFetching, refetch } = useGetPostStoreInstallationStepsPure(
        {
            accountId: currentAccountId,
            shopName,
            shopType,
        },
        {
            enabled: !!shopName && !!shopType && isTeamLeadOrAdmin,
            refetchOnWindowFocus: false,
        },
    )

    const { mutateAsync: updateNotifications } =
        useUpdateStepNotificationsPure()

    if (
        isFetching ||
        !data?.postStoreInstallationSteps?.length ||
        !isTeamLeadOrAdmin
    ) {
        return { ...DEFAULT_POST_ONBOARDING_NUDGES, isLoading: isFetching }
    }

    const postOnboardingStep = data.postStoreInstallationSteps.find(
        (step) => step.type === PostStoreInstallationStepType.POST_ONBOARDING,
    )

    if (!postOnboardingStep) {
        return DEFAULT_POST_ONBOARDING_NUDGES
    }

    if (
        postOnboardingStep.status !==
        PostStoreInstallationStepStatus.IN_PROGRESS
    ) {
        return DEFAULT_POST_ONBOARDING_NUDGES
    }

    const { stepsConfiguration, notificationsConfiguration } =
        postOnboardingStep
    const now = new Date()

    const dismissTrainNudge = async () => {
        await updateNotifications([
            postOnboardingStep.id,
            {
                guidanceInactivityAcknowledgedAt: new Date().toISOString(),
            },
        ])
        refetch()
    }

    const dismissDeployNudge = async () => {
        await updateNotifications([
            postOnboardingStep.id,
            {
                deployInactivityAcknowledgedAt: new Date().toISOString(),
            },
        ])
        refetch()
    }

    const trainStep = stepsConfiguration.find(
        (step) => step.stepName === StepName.TRAIN,
    )

    const testStep = stepsConfiguration.find(
        (step) => step.stepName === StepName.TEST,
    )

    let shouldDisplayTrainNudge = false
    if (
        trainStep?.stepStartedDatetime &&
        !trainStep?.stepCompletedDatetime &&
        !notificationsConfiguration?.guidanceInactivityAcknowledgedAt
    ) {
        const lastUpdateDate = new Date(postOnboardingStep.updatedDatetime)
        const daysSinceLastUpdate = Math.floor(
            (now.getTime() - lastUpdateDate.getTime()) / MILLISECONDS_TO_DAYS,
        )
        shouldDisplayTrainNudge =
            daysSinceLastUpdate > INACTIVITY_THRESHOLD_DAYS
    }

    let shouldDisplayDeployNudge = false
    if (
        trainStep?.stepCompletedDatetime &&
        testStep?.stepCompletedDatetime &&
        !notificationsConfiguration?.deployInactivityAcknowledgedAt
    ) {
        const lastUpdateDate = new Date(postOnboardingStep.updatedDatetime)

        const daysSinceLastUpdate = Math.floor(
            (now.getTime() - lastUpdateDate.getTime()) / MILLISECONDS_TO_DAYS,
        )

        shouldDisplayDeployNudge =
            daysSinceLastUpdate > INACTIVITY_THRESHOLD_DAYS
    }

    return {
        shouldDisplayTrainNudge,
        shouldDisplayDeployNudge,
        dismissTrainNudge,
        dismissDeployNudge,
        isLoading: false,
    }
}
