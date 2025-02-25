import { useMemo } from 'react'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'

const useUseCaseTemplates = () => {
    const { data = [], isInitialLoading } =
        useGetWorkflowConfigurationTemplates({
            triggers: ['llm-prompt'],
        })

    const templates = useMemo(
        () => data.filter((template) => template.category),
        [data],
    )

    return {
        templates,
        isLoading: isInitialLoading,
    }
}

export default useUseCaseTemplates
