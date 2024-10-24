import classnames from 'classnames'
import React from 'react'

import ToggleInput from 'pages/common/forms/ToggleInput'

import css from './HelpCenterWizardOrderManagement.less'

type HelpCenterWizardArticleRecProps = {
    onChange: (isToggled: boolean) => void
    isToggled: boolean
    isDisabled?: boolean
}

const HelpCenterWizardOrderManagement = ({
    onChange,
    isToggled,
    isDisabled = false,
}: HelpCenterWizardArticleRecProps) => {
    return (
        <div
            className={classnames({
                [css.disabled]: isDisabled,
            })}
        >
            <div className="heading-section-semibold mb-1">
                Order management
            </div>
            <div className="mb-4">
                Cards displayed are set globally for all channels from Automate
                settings.
            </div>
            <ToggleInput
                name="order-management"
                isDisabled={isDisabled}
                isToggled={isToggled}
                onClick={onChange}
            >
                Allow customers to manage orders from my Help Center
            </ToggleInput>
        </div>
    )
}

export default HelpCenterWizardOrderManagement
