import React, {useEffect, useMemo, useState} from 'react'
import closeIcon from 'assets/img/icons/close.svg'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'

import useLocalStorage from 'hooks/useLocalStorage'
import css from './ConvertCampaignsNewHomeInfobar.less'

type Props = {
    integrationId: string
}

const STORAGE_KEY_PREFIX = 'gorgias:hideCampaignsNewHome'

const ConvertCampaignsNewHomeInfobar = ({integrationId}: Props) => {
    const storageKey = useMemo(
        () => `${STORAGE_KEY_PREFIX}:${integrationId}`,
        [integrationId]
    )

    const [visible, setVisible] = useState(false)

    const [isHiddenPermanently, setIsHiddenPermanently] =
        useLocalStorage<boolean>(storageKey)

    useEffect(() => {
        if (!isHiddenPermanently) {
            setVisible(true)
        } else {
            setVisible(false)
        }
    }, [isHiddenPermanently])

    if (!visible) return <></>

    return (
        <Alert
            className="mt-4"
            icon
            customActions={
                <img
                    src={closeIcon}
                    alt="dismiss-icon"
                    className={css.close}
                    data-testid="dismiss-campaigns-new-home-infobar"
                    onClick={() => setIsHiddenPermanently(true)}
                />
            }
            type={AlertType.Info}
        >
            <b>Campaigns have a new home!</b> You can now manage your campaigns
            from the <b>Convert</b> page by clicking the top left menu in the
            sidebar, or the Edit in Convert Settings button above.
        </Alert>
    )
}

export default ConvertCampaignsNewHomeInfobar
