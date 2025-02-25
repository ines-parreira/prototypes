import classNames from 'classnames'
import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useGetConvertStatus, {
    BundleOnboardingStatus,
} from 'pages/convert/common/hooks/useGetConvertStatus'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {getIntegrationById} from 'state/integrations/selectors'
import {isAdmin, toJS} from 'utils'

type Props = {
    classes?: string
    shopIntegrationId?: number
    chatIntegrationId?: number
}

export const ConvertSetupBanner = ({
    classes,
    shopIntegrationId,
    chatIntegrationId,
}: Props): JSX.Element => {
    const currentUser = useAppSelector((state) => state.currentUser)

    const convertStatus = useGetConvertStatus(
        true,
        !!shopIntegrationId ? shopIntegrationId : chatIntegrationId
    )

    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId || 0)
    )
    const {channelConnection} = useGetOrCreateChannelConnection(
        toJS(chatIntegration)
    )

    const isBundleNotInstalled = useMemo(
        () =>
            convertStatus &&
            convertStatus.bundle_status ===
                BundleOnboardingStatus.NOT_INSTALLED,
        [convertStatus]
    )

    const isButtonVisible = useMemo(
        () => isBundleNotInstalled && isAdmin(currentUser),
        [currentUser, isBundleNotInstalled]
    )

    if (!isBundleNotInstalled) return <></>

    if (channelConnection && !channelConnection.is_onboarded) return <></>

    return (
        <div className={classNames(classes)}>
            <Alert
                customActions={
                    isButtonVisible && chatIntegrationId ? (
                        <div>
                            <Link
                                className="mr-3"
                                to={`/app/convert/${chatIntegrationId}/installation`}
                            >
                                Complete installation
                            </Link>
                        </div>
                    ) : undefined
                }
                type={AlertType.Warning}
                icon
            >
                {`Your campaigns won't be displayed on your store as long as you
                haven't completed the campaign bundle installation.`}
            </Alert>
        </div>
    )
}

export default ConvertSetupBanner
