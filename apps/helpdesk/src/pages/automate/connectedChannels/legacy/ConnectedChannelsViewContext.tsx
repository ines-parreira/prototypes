import { createContext, useContext } from 'react'

import type { SelfServiceConfiguration } from 'models/selfServiceConfiguration/types'

import type { ListWfConfigurationsResponseDto } from '../../workflows/types'

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
    })

export const useConnectedChannelsViewContext = () =>
    useContext(ConnectedChannelsViewContext)

export default ConnectedChannelsViewContext
