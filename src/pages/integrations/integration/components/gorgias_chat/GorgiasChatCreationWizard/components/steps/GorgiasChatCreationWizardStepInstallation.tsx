import React, {useState} from 'react'
import {useAsyncFn} from 'react-use'
import {Map, fromJS} from 'immutable'
import classnames from 'classnames'

import history from 'pages/history'
import {updateOrCreateIntegration} from 'state/integrations/actions'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import {getStoreIntegrations} from 'state/integrations/selectors'

import {Tab} from 'pages/integrations/integration/Integration'
import Button from 'pages/common/components/button/Button'
import {PreviewRadioButton} from 'pages/common/components/PreviewRadioButton'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import {
    NavigatedSuccessModalLocationState,
    NavigatedSuccessModalName,
} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'

import GorgiasChatIntegrationConnectStore from '../../../GorgiasChatIntegrationInstall/GorgiasChatIntegrationConnectStore'

import GorgiasChatCreationWizardStep from '../GorgiasChatCreationWizardStep'
import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'

import css from './GorgiasChatCreationWizardStepInstallation.less'

const onLeave = () => history.push('/app/settings/channels/gorgias_chat')

type Props = {
    integration: Map<any, any>
}

const GorgiasChatCreationWizardStepInstallation: React.FC<Props> = ({
    integration,
}) => {
    const dispatch = useAppDispatch()

    const {goToPreviousStep} = useNavigateWizardSteps()

    const storeIntegrations = useAppSelector(getStoreIntegrations)

    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])

    const storeIntegration = storeIntegrations.find(
        (storeIntegration) => storeIntegration.id === shopIntegrationId
    )

    const isOneClickInstallationAllowed =
        storeIntegration?.type === IntegrationType.Shopify

    const [currentIsOneClickInstallation, setIsOneClickInstallation] =
        useState<boolean>(isOneClickInstallationAllowed)

    const isOneClickInstallation = isOneClickInstallationAllowed
        ? currentIsOneClickInstallation
        : false

    const [{loading: isInstallPending}, handleInstall] =
        useAsyncFn(async () => {
            const id: number = integration.get('id')
            let meta = integration.get('meta') as Map<any, any>

            const shopIntegrationId = integration.getIn([
                'meta',
                'shop_integration_id',
            ])

            if (isOneClickInstallation) {
                meta = meta.set('shopify_integration_ids', [shopIntegrationId])
            }

            const form = {
                id,
                type: integration.get('type'),
                meta: meta
                    .setIn(
                        ['wizard', 'status'],
                        GorgiasChatCreationWizardStatus.Published
                    )
                    .toJS(),
            }

            await dispatch(
                updateOrCreateIntegration(fromJS(form), undefined, true, () => {
                    const redirectUrl = `/app/settings/channels/gorgias_chat/${id}/${
                        isOneClickInstallation
                            ? Tab.Appearance
                            : Tab.Installation
                    }`
                    const locationState: NavigatedSuccessModalLocationState = {
                        showModal: isOneClickInstallation
                            ? NavigatedSuccessModalName.GorgiasChatAutoInstallation
                            : NavigatedSuccessModalName.GorgiasChatManualInstallation,
                    }

                    history.push(redirectUrl, locationState)
                })
            )
        }, [integration, isOneClickInstallation])

    return (
        <GorgiasChatCreationWizardStep
            step={GorgiasChatCreationWizardSteps.Installation}
            preview={
                <GorgiasChatCreationWizardPreview integration={integration} />
            }
            footer={
                <>
                    <Button
                        fillStyle="ghost"
                        onClick={onLeave}
                        isDisabled={isInstallPending}
                    >
                        Save &amp; Install Later
                    </Button>
                    <div className={css.wizardButtons}>
                        <Button
                            intent="secondary"
                            onClick={goToPreviousStep}
                            isDisabled={isInstallPending}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleInstall}
                            isLoading={isInstallPending}
                        >
                            Install{' '}
                            {isOneClickInstallation ? 'Chat' : 'Manually'}
                        </Button>
                    </div>
                </>
            }
        >
            <>
                {shopIntegrationId && (
                    <div className={css.section}>
                        <div
                            className={classnames(
                                css.sectionHeading,
                                css.sectionHeadingWithLabel
                            )}
                        >
                            Connect store
                        </div>
                        <p className={css.sectionHeadingLabel}>
                            Connect a store to use Automation Add-on features in
                            chat and to enable 1-click install for Shopify.
                        </p>
                        <GorgiasChatIntegrationConnectStore
                            integration={integration}
                            storeIntegration={storeIntegration}
                            storeIntegrations={storeIntegrations}
                            isOneClickInstallation={isOneClickInstallation}
                        />
                    </div>
                )}
                <div className={css.section}>
                    <div className={css.sectionHeading}>
                        Installation method
                    </div>
                    <div className={css.radioButtonGroup}>
                        <PreviewRadioButton
                            isDisabled={!isOneClickInstallationAllowed}
                            isSelected={isOneClickInstallation}
                            label="1-click installation for Shopify"
                            caption="Add the chat widget to your Shopify store in one click."
                            value="true"
                            onClick={() => setIsOneClickInstallation(true)}
                        />
                        <PreviewRadioButton
                            isSelected={!isOneClickInstallation}
                            label="Manual installation"
                            caption="Add the chat widget to non-Shopify stores, specific pages on a Shopify store, or any other website."
                            value="false"
                            onClick={() => setIsOneClickInstallation(false)}
                        />
                    </div>
                </div>
            </>
        </GorgiasChatCreationWizardStep>
    )
}

export default GorgiasChatCreationWizardStepInstallation
