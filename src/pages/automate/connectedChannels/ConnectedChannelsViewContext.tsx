import {createContext, useContext} from 'react'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {WorkflowConfigurationShallow} from '../workflows/models/workflowConfiguration.types'

export type ConnectedChannelsViewContextType = {
    articleRecommendationHelpCenterId: Maybe<number>
    isHelpCenterEmpty: boolean
    isOrderManagementAvailable: boolean
    workflowConfigurations: WorkflowConfigurationShallow[]
    workflowsEntrypoints: NonNullable<
        SelfServiceConfiguration['workflows_entrypoints']
    >
    workflowsUrl: string
    articleRecommendationUrl: string
    quickResponsesUrl: string
    enabledQuickResponsesCount: number
}

const ConnectedChannelsViewContext =
    createContext<ConnectedChannelsViewContextType>({
        articleRecommendationHelpCenterId: null,
        isHelpCenterEmpty: false,
        isOrderManagementAvailable: true,
        workflowConfigurations: [],
        workflowsEntrypoints: [],
        workflowsUrl: '',
        articleRecommendationUrl: '',
        quickResponsesUrl: '',
        enabledQuickResponsesCount: 0,
    })

export const useConnectedChannelsViewContext = () =>
    useContext(ConnectedChannelsViewContext)

export default ConnectedChannelsViewContext
