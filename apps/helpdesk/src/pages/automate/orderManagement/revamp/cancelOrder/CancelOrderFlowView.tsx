import { Route, Switch, useParams, useRouteMatch } from 'react-router-dom'

import { ConnectedChannelsViewContainer } from 'pages/automate/connectedChannels/ConnectedChannelsViewContainer'

import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { CancelOrderConfiguration } from './components/CancelOrderConfiguration'
import { useCancelOrderFlow } from './hooks/useCancelOrderFlow'

export const CancelOrderFlowView = () => {
    const { path } = useRouteMatch()
    const { shopName } = useParams<{ shopName: string }>()

    const {
        isLoading,
        isDirty,
        isUpdatePending,
        eligibility,
        responseMessageContent,
        handleEligibilityChange,
        handleResponseMessageChange,
        handleSave,
    } = useCancelOrderFlow()

    const isSaveDisabled = !isDirty || isUpdatePending

    return (
        <>
            <OrderManagementFlowHeader
                title="Cancel order"
                flowPath="cancel"
                onSave={handleSave}
                isSaveDisabled={isSaveDisabled}
            />
            <Switch>
                <Route exact path={path}>
                    <CancelOrderConfiguration
                        shopName={shopName}
                        isLoading={isLoading}
                        eligibility={eligibility}
                        responseMessageContent={responseMessageContent}
                        onEligibilityChange={handleEligibilityChange}
                        onResponseMessageChange={handleResponseMessageChange}
                    />
                </Route>
                <Route path={`${path}/channels`}>
                    <ConnectedChannelsViewContainer />
                </Route>
            </Switch>
        </>
    )
}
