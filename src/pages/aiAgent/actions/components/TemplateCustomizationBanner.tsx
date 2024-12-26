import React, {useState} from 'react'

import Alert from 'pages/common/components/Alert/Alert'

import css from './TemplateCustomizationBanner.less'

export default function TemplateCustomizationBanner() {
    const [isAlertBannerOpen, setIsAlertBannerOpen] = useState(true)

    return (
        <>
            {isAlertBannerOpen && (
                <Alert
                    className={css.alert}
                    icon
                    onClose={() => setIsAlertBannerOpen(false)}
                >
                    This Action works out of the box without adjusting the
                    settings below. Customization is optional and can be done
                    later.
                </Alert>
            )}
        </>
    )
}
