import {createContext, useContext} from 'react'

export type ConnectedChannelsViewContextType = {
    articleRecommendationHelpCenterId: Maybe<number>
    isHelpCenterEmpty: boolean
    isOrderManagementAvailable: boolean
}

const ConnectedChannelsViewContext =
    createContext<ConnectedChannelsViewContextType>({
        articleRecommendationHelpCenterId: null,
        isHelpCenterEmpty: false,
        isOrderManagementAvailable: true,
    })

export const useConnectedChannelsViewContext = () =>
    useContext(ConnectedChannelsViewContext)

export default ConnectedChannelsViewContext
