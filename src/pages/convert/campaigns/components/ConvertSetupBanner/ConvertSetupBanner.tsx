import React, {useMemo} from 'react'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import {isAdmin, toJS} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import useGetConvertStatus, {
    BundleOnboardingStatus,
} from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {useIsConvertCampaignBundleWarningEnabled} from 'pages/settings/revenue/hooks/useIsConvertCampaignBundleWarningEnabled'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {getIntegrationById} from 'state/integrations/selectors'
import {useIsConvertOnboardingUiEnabled} from 'pages/convert/common/hooks/useIsConvertOnboardingUiEnabled'

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
    const isConvertSubscriber = useIsConvertSubscriber()
    const currentUser = useAppSelector((state) => state.currentUser)

    const isConvertCampaignBundleWarningEnabled =
        useIsConvertCampaignBundleWarningEnabled()

    const convertStatus = useGetConvertStatus(
        isConvertCampaignBundleWarningEnabled,
        !!shopIntegrationId ? shopIntegrationId : chatIntegrationId
    )

    const isOnboardingEnabled = useIsConvertOnboardingUiEnabled()
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

    if (
        isOnboardingEnabled &&
        channelConnection &&
        !channelConnection.is_onboarded
    )
        return <></>

    // don't show banner for non subscribers if flag is not enabled
    if (!isConvertCampaignBundleWarningEnabled && !isConvertSubscriber)
        return <></>

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
                Your campaigns won't be displayed on your store as long as you
                haven't completed the campaign bundle installation.
            </Alert>
        </div>
    )
}

export default ConvertSetupBanner
