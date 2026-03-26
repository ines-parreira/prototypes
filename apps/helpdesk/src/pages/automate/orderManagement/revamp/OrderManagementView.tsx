import { OrderManagementFlowsCard } from './components/OrderManagementFlowsCard/OrderManagementFlowsCard'
import { useOrderManagementFlows } from './components/OrderManagementFlowsCard/useOrderManagementFlows'

import css from './OrderManagementView.less'

export const OrderManagementViewRevamp = () => {
    const {
        isLoading,
        isUpdatePending,
        flows,
        handleFlowToggle,
        navigateToFlow,
    } = useOrderManagementFlows()

    return (
        <div className={css.container}>
            <OrderManagementFlowsCard
                isLoading={isLoading}
                isUpdatePending={isUpdatePending}
                flows={flows}
                onFlowToggle={handleFlowToggle}
                onFlowClick={navigateToFlow}
            />
        </div>
    )
}
