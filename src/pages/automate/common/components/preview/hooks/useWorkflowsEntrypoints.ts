import {useEffect, useMemo, useState} from 'react'

import {useListWorkflowEntryPoints} from 'models/workflows/queries'
import {useSelfServicePreviewContext} from '../SelfServicePreviewContext'

const useWorkflowsEntrypoints: (channelLanguage: string) => {
    workflow_id: string
    label: string
}[] = (channelLanguage) => {
    const {workflowsEntrypoints: channelAutomationSettingsEntrypoints} =
        useSelfServicePreviewContext()

    const [entrypoints, setEntrypoints] = useState<
        {
            workflow_id: string
            label: string
        }[]
    >([])

    const enabledWorkflowIdsInChannel = useMemo(() => {
        return channelAutomationSettingsEntrypoints
            ?.filter(({enabled}) => enabled)
            .map(({workflow_id}) => workflow_id)
    }, [channelAutomationSettingsEntrypoints])

    const {data: entrypointLabelByWorkflowId} = useListWorkflowEntryPoints({
        ids: enabledWorkflowIdsInChannel || [],
        language: channelLanguage,
    })
    useEffect(() => {
        enabledWorkflowIdsInChannel &&
            entrypointLabelByWorkflowId &&
            setEntrypoints(
                enabledWorkflowIdsInChannel
                    .map((workflow_id) => ({
                        workflow_id,
                        label: entrypointLabelByWorkflowId[workflow_id],
                    }))
                    // Filter out workflows that do not support the channel language
                    .filter(({label}) => label)
            )
    }, [enabledWorkflowIdsInChannel, entrypointLabelByWorkflowId])

    return entrypoints
}

export default useWorkflowsEntrypoints
