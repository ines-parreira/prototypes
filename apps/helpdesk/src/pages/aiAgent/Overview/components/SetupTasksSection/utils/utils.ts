import { StepName } from 'models/aiAgentPostStoreInstallationSteps/types'
import { Task } from 'pages/aiAgent/Overview/hooks/pendingTasks/tasks/Task'

import { RULE_ENGINE_TASK_TO_STEP_NAME, TASK_CONFIG_TEMPLATES } from '../config'
import { TaskConfig, TasksCategory } from '../types'

export const createRuleEngineTaskMap = (
    pendingTasks: Task[],
    completedTasks: Task[],
): Map<StepName, Task> => {
    const allRuleEngineTasks = [...pendingTasks, ...completedTasks]
    return new Map(
        allRuleEngineTasks
            .map((task) => {
                const stepName = task.taskType
                    ? RULE_ENGINE_TASK_TO_STEP_NAME.get(task.taskType)
                    : undefined

                return [stepName, task] as const
            })
            .filter(
                (entry): entry is [StepName, Task] => entry[0] !== undefined,
            ),
    )
}

export const createStepMapper = (
    stepNamesFromDb: Set<StepName>,
    stepCompletionMap: Map<StepName, boolean>,
    stepStartedMap: Map<StepName, string | null>,
    ruleEngineTaskMap: Map<StepName, Task>,
    shopName: string,
    shopType: string,
) => {
    return (category: TasksCategory): TaskConfig[] => {
        return TASK_CONFIG_TEMPLATES[category]
            .filter((template) => stepNamesFromDb.has(template.stepName))
            .map((template) => {
                const ruleEngineTask = ruleEngineTaskMap.get(template.stepName)
                return {
                    stepName: template.stepName,
                    displayName: template.displayName,
                    isCompleted:
                        stepCompletionMap.get(template.stepName) ?? false,
                    body: template.bodyComponent,
                    featureUrl: ruleEngineTask?.featureUrl,
                    shopName,
                    shopType,
                    stepStartedDatetime:
                        stepStartedMap.get(template.stepName) ?? null,
                }
            })
    }
}

export const getFirstIncompleteStep = (selectedCategoryTasks: TaskConfig[]) => {
    for (const task of selectedCategoryTasks) {
        if (!task.isCompleted) {
            return task.stepName
        }
    }

    return null
}
