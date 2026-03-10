import type React from 'react'
import { useState } from 'react'

import { SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { Card, Heading, Radio, RadioGroup } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatCreationWizardInstallationMethod,
    GorgiasChatCreationWizardStatus,
    IntegrationType,
} from 'models/integration/types'
import type { NavigatedSuccessModalLocationState } from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import { NavigatedSuccessModalName } from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import useNavigateWizardSteps from 'pages/common/components/wizard/hooks/useNavigateWizardSteps'
import { Tab } from 'pages/integrations/integration/types'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import useShopifyThemeAppExtension from '../../../../hooks/useShopifyThemeAppExtension'
import useThemeAppExtensionInstallation, {
    getGorgiasMainThemeAppExtensionId,
} from '../../../../hooks/useThemeAppExtensionInstallation'
import { GorgiasChatCreationWizardStep } from '../../GorgiasChatCreationWizardStep'
import useLogWizardEvent from '../../hooks/useLogWizardEvent'
import { GorgiasChatCreationWizardFooter } from '../GorgiasChatCreationWizardFooter'
import SaveChangesPrompt from '../SaveChangesPrompt'

import css from './GorgiasChatCreationWizardStepInstallation.less'

type Props = {
    integration: Map<any, any>
    isSubmitting: boolean
}

export const GorgiasChatCreationWizardStepInstallation: React.FC<Props> = ({
    integration,
    isSubmitting,
}) => {
    const logWizardEvent = useLogWizardEvent()

    const dispatch = useAppDispatch()

    const { goToPreviousStep } = useNavigateWizardSteps()

    const [hasSubmitted, setHasSubmitted] = useState(false)

    const storeIntegrations = useAppSelector(
        getIntegrationsByTypes([
            IntegrationType.Shopify,
            IntegrationType.BigCommerce,
            IntegrationType.Magento2,
        ]),
    )

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
            <SaveChangesPrompt
                onSave={() => onSave()}
                when={!!currentInstallationMethod && !hasSubmitted}
                shouldRedirectAfterSave
            />
            <GorgiasChatCreationWizardStep
                footer={
                    <GorgiasChatCreationWizardFooter
                        backButton={{
                            label: 'Back',
                            onClick: goToPreviousStep,
                            isDisabled: isSubmitting,
                        }}
                        primaryButton={{
                            label: isOneClickInstallation
                                ? 'Install'
                                : 'Install Manually',
                            onClick: () => onSave(true),
                            isLoading: isSubmitting,
                        }}
                        exitButton={{
                            label: 'Save & Install Later',
                            onClick: () =>
                                onSave(false, true)?.then(() => {
                                    history.push(
                                        '/app/settings/channels/gorgias_chat',
                                    )
                                }),
                            isDisabled: isSubmitting,
                        }}
                    />
                }
            >
                <Card p="lg">
                    <div className={css.content}>
                        <Heading size="md" className={css.heading}>
                            Installation method
                        </Heading>
                        <RadioGroup
                            value={installationMethod}
                            onChange={(value) => {
                                setCurrentInstallationMethod(
                                    value as GorgiasChatCreationWizardInstallationMethod,
                                )
                            }}
                            flexDirection="column"
                            gap="md"
                        >
                            <Radio
                                value={
                                    GorgiasChatCreationWizardInstallationMethod.OneClick
                                }
                                isDisabled={!isOneClickInstallationAllowed}
                                label={`${
                                    shouldUseThemeAppExtensionInstallation
                                        ? 'Quick'
                                        : '1-click'
                                } install for Shopify`}
                                caption={
                                    ' Install chat in a few clicks. In the Shopify window, select Install, then Save—no edits needed.'
                                }
                            />
                            <Radio
                                value={
                                    GorgiasChatCreationWizardInstallationMethod.Manual
                                }
                                label="Install manually"
                                caption="Install chat on non-Shopify stores, Shopify Headless, specific Shopify pages, or any other website."
                            />
                        </RadioGroup>
                    </div>
                </Card>
            </GorgiasChatCreationWizardStep>
        </>
    )
}
