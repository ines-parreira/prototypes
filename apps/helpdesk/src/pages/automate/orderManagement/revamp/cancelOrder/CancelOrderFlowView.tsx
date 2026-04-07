import { useParams } from 'react-router-dom'

import { OrderManagementFlowHeader } from '../components/OrderManagementFlowHeader/OrderManagementFlowHeader'
import { CancelOrderConfiguration } from './components/CancelOrderConfiguration'
import { useCancelOrderFlow } from './hooks/useCancelOrderFlow'

export const CancelOrderFlowView = () => {
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
                onSave={handleSave}
                isSaveDisabled={isSaveDisabled}
            />
            <CancelOrderConfiguration
                shopName={shopName}
                isLoading={isLoading}
                eligibility={eligibility}
                responseMessageContent={responseMessageContent}
                onEligibilityChange={handleEligibilityChange}
                onResponseMessageChange={handleResponseMessageChange}
            />
        </>
    )
}
