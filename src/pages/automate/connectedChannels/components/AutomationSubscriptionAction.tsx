import React, {useState} from 'react'

import AutomationSubscriptionButton from 'pages/settings/billing/automate/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/automate/AutomationSubscriptionModal'

const AutomationSubscriptionAction = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModalOpen,
    ] = useState(false)

    return (
        <>
            <AutomationSubscriptionButton
                label="Get Automate Features"
                size="small"
                onClick={() => {
                    setIsAutomationSubscriptionModalOpen(true)
                }}
            />
            <AutomationSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationSubscriptionModalOpen}
                onClose={() => setIsAutomationSubscriptionModalOpen(false)}
            />
        </>
    )
}

export default AutomationSubscriptionAction
