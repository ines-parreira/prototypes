import {createContext, useContext} from 'react'

import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'
import {ListWfConfigurationsResponseDto} from '../workflows/types'

export type ConnectedChannelsViewContextType = {
    articleRecommendationHelpCenterId: Maybe<number>
    isHelpCenterEmpty: boolean
    isOrderManagementAvailable: boolean
    workflowConfigurations: ListWfConfigurationsResponseDto
    workflowsEntrypoints: NonNullable<
        SelfServiceConfiguration['workflowsEntrypoints']
    >
    workflowsUrl: string
    articleRecommendationUrl: string
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
        enabledQuickResponsesCount: 0,
    })

export const useConnectedChannelsViewContext = () =>
    useContext(ConnectedChannelsViewContext)

export default ConnectedChannelsViewContext
