import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'

export enum TasksCategory {
    Essential = 'Essential',
    Customize = 'Customize',
    Train = 'Train',
    Deploy = 'Deploy',
}

export type TaskConfig = {
    stepName: StepName
    displayName: string
    isCompleted: boolean
    body: React.ComponentType
}

export type TaskConfigTemplate = {
    stepName: StepName
    displayName: string
    bodyComponent: React.ComponentType
}

export type TasksConfigByCategory = {
    [key in TasksCategory]: TaskConfig[]
}

export type TasksCategoryKey = keyof TasksConfigByCategory
