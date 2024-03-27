import React, {useEffect, useMemo} from 'react'
import {useParams} from 'react-router-dom'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {toJS} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'
import history from 'pages/history'
import Wizard from 'pages/common/components/wizard/Wizard'
import {useGetConvertBundle} from 'pages/convert/bundles/hooks/useGetConvertBundle'
import {
    BundleInstallationMethod,
    BundleStatus,
} from 'models/convert/bundle/types'
import {
    NavigatedSuccessModalLocationState,
    NavigatedSuccessModalName,
} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import {OnboardingWizardSteps} from './constants'
import WizardLayout from './components/WizardLayout'

const ConvertOnboardingWizardView = () => {
    const {[CONVERT_ROUTE_PARAM_NAME]: integrationId} =
        useParams<ConvertRouteParams>()

    const chatIntegrationId = parseInt(integrationId || '')
    const chatIntegration = useAppSelector(
        getIntegrationById(chatIntegrationId)
    )

    const storeIntegrationId = useMemo(() => {
        const id =
            !!chatIntegration &&
            (chatIntegration.getIn(['meta', 'shop_integration_id']) as number)

        if (id) {
            return id
        }
        return chatIntegrationId
    }, [chatIntegration, chatIntegrationId])

    const storeIntegration = useAppSelector(
        getIntegrationById(storeIntegrationId)
    )

    const {bundle} = useGetConvertBundle(storeIntegrationId, chatIntegrationId)

    const steps = useMemo(() => {
        return Object.values(OnboardingWizardSteps).filter((step) => {
            if (step === OnboardingWizardSteps.Install) {
                return (
                    !bundle ||
                    (bundle &&
                        (bundle.status === BundleStatus.Uninstalled ||
                            bundle.method === BundleInstallationMethod.Manual))
                )
            }

            return true
        })
    }, [bundle])
    const initialStep = OnboardingWizardSteps.Campaigns

    const {channelConnection} = useGetOrCreateChannelConnection(
        toJS(chatIntegration)
    )

    useEffect(() => {
        // Once onboarding is done, redirect user to campaigns
        if (channelConnection?.is_onboarded === true && chatIntegrationId) {
            const locationState: NavigatedSuccessModalLocationState = {
                showModal: NavigatedSuccessModalName.ConvertOnboarding,
            }
            history.push(
                `/app/convert/${chatIntegrationId}/campaigns`,
                locationState
            )
        }
    }, [channelConnection, chatIntegrationId])

    return (
        <Wizard steps={steps} startAt={initialStep}>
            <WizardLayout
                steps={steps}
                integration={chatIntegration}
                channelConnection={channelConnection}
                storeIntegration={storeIntegration}
            />
        </Wizard>
    )
}

export default ConvertOnboardingWizardView
