import {useState, useEffect} from 'react'

import useWorkflowApi from '../../workflows/hooks/useWorkflowApi'
import {WorkflowConfigurationShallow} from '../../workflows/models/workflowConfiguration.types'

const useWorkflowConfigurations = () => {
    const [isFetchPending, setIsFetchPending] = useState(true)
    const [workflowConfigurations, setWorkflowConfigurations] = useState<
        WorkflowConfigurationShallow[]
    >([])

    const {fetchWorkflowConfigurations} = useWorkflowApi()

    useEffect(() => {
        void fetchWorkflowConfigurations()
            .then(setWorkflowConfigurations)
            .then(() => setIsFetchPending(false))
    }, [fetchWorkflowConfigurations])

    return {isFetchPending, workflowConfigurations}
}

export default useWorkflowConfigurations
