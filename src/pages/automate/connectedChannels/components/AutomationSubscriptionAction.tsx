import React, {useState} from 'react'

import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'

const AutomationSubscriptionAction = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModalOpen,
    ] = useState(false)

    return (
        <>
            <AutomateSubscriptionButton
                label="Get Automate Features"
                size="small"
                onClick={() => {
                    setIsAutomationSubscriptionModalOpen(true)
                }}
            />
            <AutomateSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationSubscriptionModalOpen}
                onClose={() => setIsAutomationSubscriptionModalOpen(false)}
            />
        </>
    )
}

export default AutomationSubscriptionAction
