import { useMemo } from 'react'

import { useGetWorkflowConfigurationTemplates } from 'models/workflows/queries'

const useTemplates = () => {
    const { data = [], isInitialLoading } =
        useGetWorkflowConfigurationTemplates({
            triggers: ['llm-prompt'],
        })

    const templates = useMemo(
        () => data.filter((template) => !template.category),
        [data],
    )

    return {
        templates,
        isLoading: isInitialLoading,
    }
}

export default useTemplates
