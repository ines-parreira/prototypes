import React, {useMemo, useState} from 'react'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

export type Params = {
    isDefaultIntegrationSelected: boolean
}

export function useDefaultEmailSelectedBanner({
    isDefaultIntegrationSelected,
}: Params) {
    const [isAlertAcknowledged, setIsAlertAcknowledged] = useState(false)

    return useMemo(() => {
        const resetAcknowledgement = () => setIsAlertAcknowledged(false)
        const acknowledge = () => setIsAlertAcknowledged(true)

        const BannerComponent =
            isDefaultIntegrationSelected && !isAlertAcknowledged ? (
                <Alert
                    icon
                    data-testid="alert"
                    type={AlertType.Info}
                    onClose={acknowledge}
                >
                    The default Gorgias email is selected. Make sure to set the
                    desired email for your form.
                </Alert>
            ) : null

        return {
            BannerComponent,
            resetAcknowledgement,
        }
    }, [isAlertAcknowledged, isDefaultIntegrationSelected])
}
