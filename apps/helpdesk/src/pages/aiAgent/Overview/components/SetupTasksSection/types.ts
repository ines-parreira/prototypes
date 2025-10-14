import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

export enum TasksCategory {
    Essential = 'Essential',
    Customize = 'Customize',
    Train = 'Train',
    Deploy = 'Deploy',
}

export type TaskBodyProps = {
    featureUrl?: string
    isCompleted?: boolean
    shopName?: string
    shopType?: string
    stepName?: StepName
    postGoLiveStepId?: string
    stepStartedDatetime?: string | null
}

export type TaskConfig = {
    stepName: StepName
    displayName: string
    isCompleted: boolean
    body: React.ComponentType<TaskBodyProps>
    featureUrl?: string
    shopName?: string
    shopType?: string
    stepStartedDatetime?: string | null
}

export type TaskConfigTemplate = {
    stepName: StepName
    displayName: string
    bodyComponent: React.ComponentType<TaskBodyProps>
}

export type TasksConfigByCategory = {
    [key in TasksCategory]: TaskConfig[]
}

export type TasksCategoryKey = keyof TasksConfigByCategory
