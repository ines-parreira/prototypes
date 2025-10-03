import { useState } from 'react'

import { Heading, Text } from '@gorgias/axiom'

import loadingStaticIcon from 'assets/img/ai-agent/loading.svg'

import { CategoryContent } from './CategoryContent'
import { CategoryList } from './CategoryList'
import {
    CreateAnActionBody,
    EnableAIAgentOnChatBody,
    EnableAIAgentOnEmailBody,
    EnableAskAnythingBody,
    EnableSuggestedProductsBody,
    EnableTriggerOnSearchBody,
    MonitorAiAgentBody,
    UpdateShopifyPermissionsBody,
    VerifyEmailDomainBody,
} from './SetupTaskBodies'
import { TasksCategory, TasksConfigByCategory } from './types'

import css from './SetupTaskSection.less'

const TaskNames = {
    VerifyEmailDomain: 'Verify your email domain',
    UpdateShopifyPermissions: 'Update Shopify permissions',
    CreateAnAction: 'Create an Action',
    MonitorAiAgent: 'Monitor AI Agent interactions',
    EnableTriggerOnSearch: `Enable 'Trigger on Search'`,
    EnableSuggestedProducts: `Enable 'Suggested product questions'`,
    EnableAskAnything: `Enable 'Ask anything input'`,
    EnableAIAgentOnChat: 'Enable AI Agent on chat',
    EnableAIAgentOnEmail: 'Enable AI Agent on email',
}

const tasksConfigByCategory: TasksConfigByCategory = {
    [TasksCategory.Essential]: [
        {
            name: TaskNames.VerifyEmailDomain,
            isCompleted: true,
            body: <VerifyEmailDomainBody />,
        },
        {
            name: TaskNames.UpdateShopifyPermissions,
            isCompleted: true,
            body: <UpdateShopifyPermissionsBody />,
        },
    ],
    [TasksCategory.Customize]: [
        {
            name: TaskNames.EnableTriggerOnSearch,
            isCompleted: false,
            body: <EnableTriggerOnSearchBody />,
        },
        {
            name: TaskNames.EnableSuggestedProducts,
            isCompleted: false,
            body: <EnableSuggestedProductsBody />,
        },
        {
            name: TaskNames.EnableAskAnything,
            isCompleted: false,
            body: <EnableAskAnythingBody />,
        },
    ],
    [TasksCategory.Train]: [
        {
            name: TaskNames.CreateAnAction,
            isCompleted: false,
            body: <CreateAnActionBody />,
        },
        {
            name: TaskNames.MonitorAiAgent,
            isCompleted: false,
            body: <MonitorAiAgentBody />,
        },
    ],
    [TasksCategory.Deploy]: [
        {
            name: TaskNames.EnableAIAgentOnChat,
            isCompleted: false,
            body: <EnableAIAgentOnChatBody />,
        },
        {
            name: TaskNames.EnableAIAgentOnEmail,
            isCompleted: false,
            body: <EnableAIAgentOnEmailBody />,
        },
    ],
}

export const SetupTaskSection = () => {
    const [selectedCategory, setSelectedCategory] = useState<TasksCategory>(
        TasksCategory.Essential,
    )
    const categories = Object.keys(tasksConfigByCategory) as TasksCategory[]

    const selectedCategoryTasks = tasksConfigByCategory[selectedCategory]

    return (
        <div className={css.container}>
            <div className={css.header}>
                <Heading>Setup checklist</Heading>
                <div className={css.progress}>
                    <img
                        src={loadingStaticIcon}
                        alt="loading icon"
                        width="16px"
                    />
                    <Text size="sm" variant="bold">
                        20% complete
                    </Text>
                </div>
            </div>
            <div className={css.tasksSection}>
                <CategoryList
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    tasksConfigByCategory={tasksConfigByCategory}
                />
                <CategoryContent
                    selectedCategoryTasks={selectedCategoryTasks}
                />
            </div>
        </div>
    )
}
