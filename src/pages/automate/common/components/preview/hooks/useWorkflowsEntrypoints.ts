import {useEffect, useState} from 'react'
import _mapValues from 'lodash/mapValues'

import useWorkflowApi from 'pages/automate/workflows/hooks/useWorkflowApi'

import {useSelfServicePreviewContext} from '../SelfServicePreviewContext'

const useWorkflowsEntrypoints: (channelLanguage: string) => {
    workflow_id: string
    label: string
}[] = (channelLanguage) => {
    const {workflowsEntrypoints: channelAutomationSettingsEntrypoints} =
        useSelfServicePreviewContext()
    const {fetchWorkflowEntrypoints} = useWorkflowApi()

    const [entrypoints, setEntrypoints] = useState<
        {
            workflow_id: string
            label: string
        }[]
    >([])
    useEffect(() => {
        async function f() {
            const enabledWorkflowIdsInChannel =
                channelAutomationSettingsEntrypoints
                    ?.filter(({enabled}) => enabled)
                    .map(({workflow_id}) => workflow_id)
            if (
                !enabledWorkflowIdsInChannel ||
                enabledWorkflowIdsInChannel.length === 0
            ) {
                setEntrypoints([])
                return
            }
            const entrypoints = await fetchWorkflowEntrypoints(
                enabledWorkflowIdsInChannel,
                channelLanguage
            )
            const entrypointLabelByWorkflowId: Record<string, string> =
                _mapValues(entrypoints, 'label')
            setEntrypoints(
                enabledWorkflowIdsInChannel
                    .map((workflow_id) => ({
                        workflow_id,
                        label: entrypointLabelByWorkflowId[workflow_id],
                    }))
                    // Filter out workflows that do not support the channel language
                    .filter(({label}) => label)
            )
        }
        void f()
    }, [
        channelAutomationSettingsEntrypoints,
        channelLanguage,
        fetchWorkflowEntrypoints,
    ])

    return entrypoints
}

export default useWorkflowsEntrypoints
