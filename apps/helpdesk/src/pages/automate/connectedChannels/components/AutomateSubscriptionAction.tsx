import React, { useState } from 'react'

import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'

const AutomateSubscriptionAction = () => {
    const [
        isAutomateSubscriptionModalOpen,
        setIsAutomateSubscriptionModalOpen,
    ] = useState(false)

    return (
        <>
            <AutomateSubscriptionButton
                label="Get AI Agent Features"
                size="small"
                onClick={() => {
                    setIsAutomateSubscriptionModalOpen(true)
                }}
            />
            <AutomateSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomateSubscriptionModalOpen}
                onClose={() => setIsAutomateSubscriptionModalOpen(false)}
            />
        </>
    )
}

export default AutomateSubscriptionAction
