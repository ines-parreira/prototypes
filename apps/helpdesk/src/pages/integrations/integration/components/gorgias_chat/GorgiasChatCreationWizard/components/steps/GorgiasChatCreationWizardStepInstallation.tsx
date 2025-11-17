import type React from 'react'
import { useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import classnames from 'classnames'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatCreationWizardInstallationMethod,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import { PreviewRadioButton } from 'pages/common/components/PreviewRadioButton'
import type { NavigatedSuccessModalLocationState } from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import { NavigatedSuccessModalName } from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { Tab } from 'pages/integrations/integration/types'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getStoreIntegrations } from 'state/integrations/selectors'

import GorgiasChatIntegrationConnectStore from '../../../GorgiasChatIntegrationInstall/GorgiasChatIntegrationConnectStore'
import useShopifyThemeAppExtension from '../../../hooks/useShopifyThemeAppExtension'
import useThemeAppExtensionInstallation, {
    getGorgiasMainThemeAppExtensionId,
} from '../../../hooks/useThemeAppExtensionInstallation'
import useLogWizardEvent from '../../hooks/useLogWizardEvent'
import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'
import GorgiasChatCreationWizardStep from '../GorgiasChatCreationWizardStep'

import css from './GorgiasChatCreationWizardStepInstallation.less'

type Props = {
    integration: Map<any, any>
    isSubmitting: boolean
}

const GorgiasChatCreationWizardStepInstallation: React.FC<Props> = ({
    integration,
    isSubmitting,
}) => {
    const logWizardEvent = useLogWizardEvent()

    const dispatch = useAppDispatch()

    const { goToPreviousStep } = useNavigateWizardSteps()

    const [hasSubmitted, setHasSubmitted] = useState(false)

    const storeIntegrations = useAppSelector(getStoreIntegrations)

    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])

    const storeIntegration = storeIntegrations.find(
        (storeIntegration) => storeIntegration.id === shopIntegrationId,
    )

    const isOneClickInstallationAllowed =
        storeIntegration?.type === IntegrationType.Shopify

    const [currentInstallationMethod, setCurrentInstallationMethod] =
        useState<GorgiasChatCreationWizardInstallationMethod>()

    const isStoreOfShopifyType =
        storeIntegration?.type === IntegrationType.Shopify

    const {
        shouldUseThemeAppExtensionInstallation,
        themeAppExtensionInstallationUrl,
    } = useThemeAppExtensionInstallation(
        isStoreOfShopifyType ? storeIntegration : undefined,
    )

    const { isInstalled: isThemeAppExtensionInstalled } =
        useShopifyThemeAppExtension({
            shopifyIntegration: isStoreOfShopifyType
                ? storeIntegration
                : undefined,
            appUuid: getGorgiasMainThemeAppExtensionId(),
        })

    const installationMethod = isOneClickInstallationAllowed
        ? (currentInstallationMethod ??
          integration.getIn(
              ['meta', 'wizard', 'installation_method'],
              GorgiasChatCreationWizardInstallationMethod.OneClick,
          ))
        : GorgiasChatCreationWizardInstallationMethod.Manual

    const isOneClickInstallation =
        installationMethod ===
        GorgiasChatCreationWizardInstallationMethod.OneClick

    const onSave = async (shouldPublish = false, isContinueLater = false) => {
        const id: number = integration.get('id')
        let meta = integration.get('meta') as Map<any, any>

        if (shouldPublish) {
            meta = meta.setIn(
                ['wizard', 'status'],
                GorgiasChatCreationWizardStatus.Published,
            )

            if (isOneClickInstallation) {
                const shopIntegrationId = integration.getIn([
                    'meta',
                    'shop_integration_id',
                ])

                meta = meta.set('shopify_integration_ids', [shopIntegrationId])
            }
        }

        meta = meta.setIn(['wizard', 'installation_method'], installationMethod)

        const form = {
            id,
            type: integration.get('type'),
            meta: meta.toJS(),
        }

        return dispatch(
            updateOrCreateIntegration(
                fromJS(form),
                undefined,
                true,
                () => {
                    logWizardEvent(
                        isContinueLater
                            ? SegmentEvent.ChatWidgetWizardSaveLaterClicked
                            : SegmentEvent.ChatWidgetWizardStepCompleted,
                        {
                            installation_method: installationMethod,
                        },
                    )

                    setHasSubmitted(true)

                    if (shouldPublish) {
                        const redirectUrl = `/app/settings/channels/gorgias_chat/${id}/${
                            isOneClickInstallation
                                ? Tab.Preferences
                                : Tab.Installation
                        }`
                        const locationState: NavigatedSuccessModalLocationState =
                            {
                                showModal: isOneClickInstallation
                                    ? NavigatedSuccessModalName.GorgiasChatAutoInstallation
                                    : NavigatedSuccessModalName.GorgiasChatManualInstallation,
                            }

                        history.push(redirectUrl, locationState)

                        if (
                            isOneClickInstallation &&
                            shouldUseThemeAppExtensionInstallation &&
                            themeAppExtensionInstallationUrl &&
                            !isThemeAppExtensionInstalled
                        ) {
                            window.open(
                                themeAppExtensionInstallationUrl,
                                '_blank',
                                'noopener noreferrer',
                            )
                        }
                    }
                },
                shouldPublish,
                'Changes saved',
            ),
        )
    }

    return (
        <>
            <UnsavedChangesPrompt
                onSave={() => onSave()}
                when={!!currentInstallationMethod && !hasSubmitted}
                shouldRedirectAfterSave
            />
            <GorgiasChatCreationWizardStep
                step={GorgiasChatCreationWizardSteps.Installation}
                preview={
                    <GorgiasChatCreationWizardPreview
                        integration={integration}
                    />
                }
                footer={
                    <>
                        <Button
                            fillStyle="ghost"
                            onClick={() =>
                                onSave(false, true)?.then(() => {
                                    history.push(
                                        '/app/settings/channels/gorgias_chat',
                                    )
                                })
                            }
                            isDisabled={isSubmitting}
                        >
                            Save &amp; Install Later
                        </Button>
                        <div className={css.wizardButtons}>
                            <Button
                                intent="secondary"
                                onClick={goToPreviousStep}
                                isDisabled={isSubmitting}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => onSave(true)}
                                isLoading={isSubmitting}
                            >
                                Install{' '}
                                {isOneClickInstallation ? '' : 'Manually'}
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
                                    css.sectionHeadingWithLabel,
                                )}
                            >
                                Connect store
                            </div>
                            <p className={css.sectionHeadingLabel}>
                                Connect a store to use AI Agent features in chat
                                and to enable{' '}
                                {shouldUseThemeAppExtensionInstallation
                                    ? 'quick'
                                    : '1-click'}{' '}
                                install for Shopify.
                            </p>
                            <GorgiasChatIntegrationConnectStore
                                integration={integration}
                                storeIntegration={storeIntegration}
                                storeIntegrations={storeIntegrations}
                                isOneClickInstallation={isOneClickInstallation}
                                changeButtonLabel="Change store"
                                allowDisconnect={false}
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
                                label={`${
                                    shouldUseThemeAppExtensionInstallation
                                        ? 'Quick'
                                        : '1-click'
                                } installation for Shopify`}
                                caption={
                                    shouldUseThemeAppExtensionInstallation
                                        ? isThemeAppExtensionInstalled
                                            ? 'To add Chat to your Shopify store, click Install.'
                                            : 'To add Chat, click Install then Save in the new Shopify window without editing anything.'
                                        : 'Add the chat widget to your Shopify store in one click.'
                                }
                                value="true"
                                onClick={() =>
                                    setCurrentInstallationMethod(
                                        GorgiasChatCreationWizardInstallationMethod.OneClick,
                                    )
                                }
                            />
                            <PreviewRadioButton
                                isSelected={!isOneClickInstallation}
                                label="Manual installation"
                                caption="Add the chat widget to non-Shopify stores, Shopify Headless, specific pages on a Shopify store, or any other website."
                                value="false"
                                onClick={() =>
                                    setCurrentInstallationMethod(
                                        GorgiasChatCreationWizardInstallationMethod.Manual,
                                    )
                                }
                            />
                        </div>
                    </div>
                </>
            </GorgiasChatCreationWizardStep>
        </>
    )
}

export default GorgiasChatCreationWizardStepInstallation
