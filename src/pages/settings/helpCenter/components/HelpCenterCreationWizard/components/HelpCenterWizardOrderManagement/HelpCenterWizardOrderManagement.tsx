import React from 'react'
import ToggleInput from 'pages/common/forms/ToggleInput'

type HelpCenterWizardArticleRecProps = {
    onChange: (enabled: boolean) => void
    enabled: boolean
}

const HelpCenterWizardOrderManagement = ({
    onChange,
    enabled,
}: HelpCenterWizardArticleRecProps) => {
    return (
        <div>
            <div className="heading-section-semibold mb-1">
                Order management
            </div>
            <div className="mb-4">
                Cards displayed are set globally for all channels from Automate
                settings.
            </div>
            <ToggleInput
                name="order-management"
                isToggled={enabled}
                onClick={onChange}
            >
                Allow customers to manage orders from my Help Center
            </ToggleInput>
        </div>
    )
}

export default HelpCenterWizardOrderManagement
