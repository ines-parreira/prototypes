import type React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { isAxiosError } from 'axios'
import { get } from 'lodash'
import _debounce from 'lodash/debounce'
import { Route, Switch, useHistory, useLocation } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'
import { IntegrationType } from '@gorgias/helpdesk-queries'

import warningIcon from 'assets/img/icons/warning2.svg'
import useAppDispatch from 'hooks/useAppDispatch'
import Accordion from 'pages/common/components/accordion/Accordion'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import BackLink from 'pages/common/components/BackLink'
import { ConfirmModalAction } from 'pages/common/components/ConfirmModalAction'
import CopyText from 'pages/common/components/CopyText'
import InstallationCodeSnippet from 'pages/common/components/InstallationCodeSnippet/InstallationCodeSnippet'
import TabNavigator from 'pages/common/components/TabNavigator/TabNavigator'
import InputField from 'pages/common/forms/input/InputField'
import { useGetPageEmbedments } from 'pages/settings/helpCenter/queries'
import settingsCss from 'pages/settings/settings.less'
import type { Paths } from 'rest_api/help_center_api/client.generated'
import {
    helpCenterDeleted,
    helpCenterUpdated,
} from 'state/entities/helpCenter/helpCenters/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { reportError } from 'utils/errors'

import {
    HELP_CENTER_BASE_PATH,
    MANUALLY_EMBED_STEPS,
    MANUALLY_EMBED_TABS,
    ManuallyEmbedOptions,
} from '../constants'
import useCurrentHelpCenter from '../hooks/useCurrentHelpCenter'
import { useHelpCenterActions } from '../hooks/useHelpCenterActions'
import { useHelpCenterApi } from '../hooks/useHelpCenterApi'
import { useStoreIntegrationByShopName } from '../hooks/useStoreIntegrationByShopName'
import { useHelpCenterPreferencesSettings } from '../providers/HelpCenterPreferencesSettings'
import { getAbsoluteUrl, getHelpCenterDomain } from '../utils/helpCenter.utils'
import {
    getSubdomainValidationError,
    isValidSubdomain,
} from '../utils/validations'
import { ConnectToShopSection } from './ConnectToShopSection'
import { CustomDomain } from './CustomDomain'
import GoogleAnalyticsSection from './GoogleAnalyticSection'
import HelpCenterAutoEmbedPublishSection from './HelpCenterAutoEmbedPublishSection'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import ManageEmbedments from './ManageEmbedments'
import { SubdomainSection } from './SubdomainSection'
import { UpdateToggle } from './UpdateToggle'

import css from './HelpCenterPublishAndTrackView.less'

export const HelpCenterInstallationView: React.FC = () => {
    const dispatch = useAppDispatch()
    const canUseHelpCenterAutoEmbed = useFlag(
        FeatureFlagKey.HelpCenterAutoEmbed,
    )
    const history = useHistory()
    const location = useLocation()
    const helpCenter = useCurrentHelpCenter()
    const helpCenterId = helpCenter.id
    const { client } = useHelpCenterApi()
    const [subdomainValue, setSubdomainValue] = useState<string>()
    const [gaid, setGaid] = useState<string | null>(null)
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(true)
    const [deleteModalConfirmation, setDeleteModalConfirmation] = useState('')
    const [showWarning, setShowWarning] = useState(true)
    const [showConnectToStoreWarning, setShowConnectToStoreWarning] =
        useState(true)
    const [activeTab, setActiveTab] = useState<string>(
        ManuallyEmbedOptions.SHOPIFY,
    )
    const getPageEmbedments = useGetPageEmbedments(helpCenterId, {
        enabled: Boolean(helpCenter.shop_name),
    })

    const { getHelpCenterCustomDomain } = useHelpCenterActions()
    const {
        preferences,
        updatePreferences,
        savePreferences,
        canSavePreferences,
        isSavingInProgress,
    } = useHelpCenterPreferencesSettings()
    const isPreferencesFetched = useMemo(
        () => preferences.availableLanguages.length > 0,
        [preferences.availableLanguages],
    )

    const selectedShop = useStoreIntegrationByShopName(
        preferences.connectedShop.shopName ?? '',
        preferences.connectedShop.shopIntegrationId,
    )

    const isConnectedToShopifyShop = useMemo(
        () =>
            Boolean(preferences.connectedShop.shopName) &&
            !!selectedShop &&
            selectedShop.type === IntegrationType.Shopify,
        [preferences.connectedShop.shopName, selectedShop],
    )

    const helpCenterUrl = useMemo(() => {
        const domain = getHelpCenterDomain(helpCenter)
        return getAbsoluteUrl({ domain })
    }, [helpCenter])

    const subdomainError = subdomainValue
        ? getSubdomainValidationError(subdomainValue, isSubdomainAvailable)
        : null
    const isNewSubdomainValid =
        subdomainValue &&
        subdomainValue !== helpCenter.subdomain &&
        !subdomainError
    const isUpdatedGaid =
        helpCenter.gaid === null ? !!gaid : helpCenter.gaid !== gaid

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkSubdomainAvailability = useCallback(
        _debounce(async () => {
            if (
                client &&
                subdomainValue &&
                isValidSubdomain(subdomainValue) &&
                subdomainValue !== helpCenter.subdomain
            ) {
                try {
                    await client.checkHelpCenterWithSubdomainExists({
                        subdomain: subdomainValue,
                    })

                    setIsSubdomainAvailable(false)
                } catch (err) {
                    if (isAxiosError(err) && err.response?.status === 404) {
                        setIsSubdomainAvailable(true)
                    } else {
                        throw err
                    }
                }
            }
        }, 500),
        [subdomainValue],
    )

    const handleOnDeleteHelpCenter = () => {
        if (client) {
            void client
                .deleteHelpCenter({
                    help_center_id: helpCenterId,
                })
                .then(() => {
                    dispatch(helpCenterDeleted(helpCenterId))
                    history.push(
                        location.pathname.split(helpCenterId.toString())[0],
                    )
                    void dispatch(
                        notify({
                            message: 'Help Center deleted with success',
                            status: NotificationStatus.Success,
                        }),
                    )
                })
                .catch((err) => {
                    const errorMessage =
                        (isAxiosError(err) &&
                            get(err, 'response.status') === 400 &&
                            get(err, 'response.data.message')) ||
                        'Could not delete the Help Center'

                    void dispatch(
                        notify({
                            message: errorMessage,
                            status: NotificationStatus.Error,
                        }),
                    )
                    reportError(err as Error)
                })
        }
    }

    const handleOnUpdateHelpCenter = useCallback(
        async (delta: Partial<Paths.UpdateHelpCenter.RequestBody>) => {
            if (!client) {
                return
            }

            try {
                const response = await client.updateHelpCenter(
                    {
                        help_center_id: helpCenterId,
                    },
                    delta,
                )

                dispatch(helpCenterUpdated(response.data))
                void dispatch(
                    notify({
                        message: 'Help Center updated with success',
                        status: NotificationStatus.Success,
                    }),
                )
            } catch (err) {
                // TODO: Add different messages based on error response code
                void dispatch(
                    notify({
                        message: 'Could not update the Help Center',
                        status: NotificationStatus.Error,
                    }),
                )
                reportError(err as Error)
            }
        },
        [client, dispatch, helpCenterId],
    )

    const handleOnCancel = () => {
        setSubdomainValue(helpCenter.subdomain)
        setGaid(helpCenter.gaid)
    }

    const handleOnSave = useCallback(
        async () =>
            await handleOnUpdateHelpCenter({
                ...(isNewSubdomainValid ? { subdomain: subdomainValue } : {}),
                ...(isUpdatedGaid ? { gaid } : {}),
            }),
        [
            handleOnUpdateHelpCenter,
            isNewSubdomainValid,
            subdomainValue,
            isUpdatedGaid,
            gaid,
        ],
    )

    const onConnectedShopChange = ({
        shop_name,
        shop_integration_id,
        self_service_deactivated,
    }: {
        shop_name: string | null
        shop_integration_id: number | null
        self_service_deactivated?: boolean
    }) => {
        updatePreferences({
            connectedShop: {
                shopName: shop_name,
                shopIntegrationId: shop_integration_id,
                selfServiceDeactivated: Boolean(self_service_deactivated),
            },
        })
    }

    useEffect(() => {
        if (canSavePreferences && !isSavingInProgress && isPreferencesFetched) {
            void savePreferences()
        }
    }, [
        canSavePreferences,
        savePreferences,
        isSavingInProgress,
        isPreferencesFetched,
    ])

    useEffect(() => {
        setIsSubdomainAvailable(true)

        void checkSubdomainAvailability()

        return () => checkSubdomainAvailability.cancel()
    }, [subdomainValue, checkSubdomainAvailability])

    const deleteBtnDisabled =
        deleteModalConfirmation?.trim() !== helpCenter.name?.trim() // Trim to avoid being blocked in the deletion because of a trailing space in Help Center name.

    useEffect(() => {
        if (helpCenter.subdomain) {
            setSubdomainValue(helpCenter.subdomain)
        }
        setGaid(helpCenter.gaid)
    }, [helpCenter.subdomain, helpCenter.gaid])

    useEffect(() => {
        void getHelpCenterCustomDomain()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            className={css.container}
            isDirty={isNewSubdomainValid || isUpdatedGaid}
            onSaveChanges={handleOnSave}
        >
            <Switch>
                <Route
                    exact
                    path={`${HELP_CENTER_BASE_PATH}/:helpCenterId/publish-track/embedments`}
                >
                    <BackLink
                        path={`${HELP_CENTER_BASE_PATH}/${helpCenterId}/publish-track`}
                        label={'Back to Publish & Track'}
                    />
                    <ManageEmbedments
                        embedments={getPageEmbedments.data ?? []}
                        isEmbedmentsLoading={getPageEmbedments.isLoading}
                        helpCenterId={helpCenterId}
                        shopName={helpCenter.shop_name}
                    />
                </Route>
                <Route
                    exact
                    path={`${HELP_CENTER_BASE_PATH}/:helpCenterId/publish-track`}
                >
                    <ConnectToShopSection
                        onUpdate={onConnectedShopChange}
                        shopName={selectedShop?.name || null}
                        shopType={selectedShop?.type || null}
                        shopIntegrationId={selectedShop?.id || null}
                    />
                    <section className="mb-4">
                        <h3 className={css.sectionTitle}>Publish</h3>
                        <UpdateToggle
                            activated={
                                !Boolean(helpCenter.deactivated_datetime)
                            }
                            description="You must set your Help Center live to make it visible to customers via the direct link or embed options."
                            fieldName="deactivated"
                            label="Set Help Center live"
                        />
                        {canUseHelpCenterAutoEmbed ? (
                            // The new Publish section
                            <div className={css.cards}>
                                {!isConnectedToShopifyShop &&
                                    showConnectToStoreWarning && (
                                        <Alert
                                            type={AlertType.Warning}
                                            icon
                                            onClose={() =>
                                                setShowConnectToStoreWarning(
                                                    false,
                                                )
                                            }
                                        >
                                            Connect Shopify to enable
                                            auto-embedding to your website.
                                        </Alert>
                                    )}
                                <HelpCenterAutoEmbedPublishSection
                                    helpCenterId={helpCenterId}
                                    helpCenterShopName={helpCenter.shop_name}
                                    pageEmbedments={
                                        getPageEmbedments.data ?? []
                                    }
                                    isDisabled={
                                        Boolean(
                                            helpCenter.deactivated_datetime,
                                        ) ||
                                        (getPageEmbedments.isLoading &&
                                            !getPageEmbedments.isFetched)
                                    }
                                />
                                <Accordion>
                                    <AccordionItem
                                        isDisabled={Boolean(
                                            helpCenter.deactivated_datetime,
                                        )}
                                    >
                                        <AccordionHeader>
                                            <div>
                                                <div className={css.cardHeader}>
                                                    Manually embed with code
                                                </div>
                                                <div>
                                                    Use HTML to manually display
                                                    your Help Center on specific
                                                    pages of your website.
                                                    <br />
                                                    Note: You must have access
                                                    to your site theme.
                                                </div>
                                            </div>
                                        </AccordionHeader>
                                        <AccordionBody>
                                            <TabNavigator
                                                tabs={MANUALLY_EMBED_TABS}
                                                className={css.tabNavigator}
                                                activeTab={activeTab}
                                                onTabChange={(tab) =>
                                                    setActiveTab(tab)
                                                }
                                            />
                                            <>
                                                <div className={css.steps}>
                                                    {MANUALLY_EMBED_STEPS[
                                                        activeTab as keyof typeof MANUALLY_EMBED_STEPS
                                                    ].map(
                                                        (step: JSX.Element) =>
                                                            step,
                                                    )}
                                                </div>
                                                <Alert
                                                    type={AlertType.Warning}
                                                    className={settingsCss.mb24}
                                                >
                                                    Make sure to insert the code
                                                    on <b>all pages</b> you wish
                                                    to display your Help Center.
                                                </Alert>
                                                <InstallationCodeSnippet
                                                    onCopy={() =>
                                                        logEvent(
                                                            SegmentEvent.HelpCenterManualEmbedCopyCode,
                                                        )
                                                    }
                                                    code={
                                                        helpCenter.code_snippet_template
                                                    }
                                                />
                                            </>
                                        </AccordionBody>
                                    </AccordionItem>
                                    <AccordionItem
                                        isDisabled={Boolean(
                                            helpCenter.deactivated_datetime,
                                        )}
                                    >
                                        <AccordionHeader>
                                            <div>
                                                <div className={css.cardHeader}>
                                                    Share your Help Center using
                                                    a subdomain or custom domain
                                                </div>
                                                <CopyText
                                                    text={helpCenterUrl}
                                                />
                                            </div>
                                        </AccordionHeader>
                                        <AccordionBody>
                                            {showWarning && (
                                                <LinkAlert
                                                    actionLabel="Learn more"
                                                    type={AlertType.Warning}
                                                    className={css.alert}
                                                    actionHref="https://docs.gorgias.com/en-US/help-center---setup-81865#link-to-shopify"
                                                    onClose={() => {
                                                        setShowWarning(false)
                                                    }}
                                                >
                                                    <div
                                                        className={
                                                            css.alertContent
                                                        }
                                                    >
                                                        <img
                                                            src={warningIcon}
                                                            alt="warning icon"
                                                        />
                                                        <div>
                                                            {`Don't forget to link
                                                            the Help Center to
                                                            your website.`}
                                                        </div>
                                                    </div>
                                                </LinkAlert>
                                            )}
                                            <div
                                                className={css.subdomainSection}
                                            >
                                                <SubdomainSection
                                                    value={subdomainValue}
                                                    caption="The URL used to access your help center."
                                                    placeholder="brand-name"
                                                    onChange={setSubdomainValue}
                                                    error={subdomainError}
                                                />
                                            </div>
                                            <CustomDomain />
                                        </AccordionBody>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        ) : (
                            // The old Publish section
                            <>
                                <SubdomainSection
                                    value={subdomainValue}
                                    caption="This is the URL that can be used to access your help center."
                                    placeholder="brand-name"
                                    onChange={setSubdomainValue}
                                    error={subdomainError}
                                />
                                <CustomDomain className={settingsCss.mb40} />
                            </>
                        )}
                    </section>

                    <section className="mb-4">
                        <h3 className={css.sectionTitle}>Track</h3>
                    </section>
                    <GoogleAnalyticsSection
                        gaid={gaid ?? ''}
                        onChange={(value) => {
                            setGaid(value.toUpperCase())
                        }}
                        onDelete={
                            helpCenter.gaid
                                ? () => {
                                      void handleOnUpdateHelpCenter({
                                          gaid: null,
                                      })
                                  }
                                : null
                        }
                    />

                    <div className={css.ctasGroup}>
                        <div className={css.leftSideButtons}>
                            <Button
                                isDisabled={
                                    !isNewSubdomainValid && !isUpdatedGaid
                                }
                                onClick={() =>
                                    handleOnUpdateHelpCenter({
                                        ...(isNewSubdomainValid
                                            ? { subdomain: subdomainValue }
                                            : {}),
                                        ...(isUpdatedGaid
                                            ? { gaid: gaid || null }
                                            : {}),
                                    })
                                }
                            >
                                Save Changes
                            </Button>
                            <Button intent="secondary" onClick={handleOnCancel}>
                                Cancel
                            </Button>
                        </div>

                        <ConfirmModalAction
                            actions={(onClose) => (
                                <>
                                    <Button
                                        intent="secondary"
                                        onClick={() => {
                                            setDeleteModalConfirmation('')
                                            onClose()
                                        }}
                                        className={css['cancel-btn']}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className={css['delete-btn']}
                                        isDisabled={deleteBtnDisabled}
                                        intent="secondary"
                                        onClick={handleOnDeleteHelpCenter}
                                    >
                                        <i className="material-icons">delete</i>
                                        Delete Forever
                                    </Button>
                                </>
                            )}
                            content={
                                <>
                                    <p>
                                        This Help Center and its articles,
                                        categories, pages and images will be
                                        deleted permanently. Future contact form
                                        submissions will not be captured.
                                    </p>

                                    <p>
                                        <strong>
                                            Confirm by typing{' '}
                                            <span
                                                className={
                                                    css[
                                                        'delete-modal-help-center'
                                                    ]
                                                }
                                            >
                                                {helpCenter.name}
                                            </span>{' '}
                                            below
                                        </strong>
                                    </p>

                                    <InputField
                                        type="text"
                                        className={css['delete-modal-input']}
                                        name="help-center-delete-confirmation"
                                        placeholder={'[Help Center Name]'}
                                        value={deleteModalConfirmation}
                                        onChange={setDeleteModalConfirmation}
                                    />
                                </>
                            }
                            title="Delete confirmation"
                        >
                            {(onClick) => (
                                <Button
                                    className={css['delete-btn']}
                                    intent="destructive"
                                    fillStyle="ghost"
                                    onClick={onClick}
                                >
                                    <i className="material-icons">delete</i>
                                    Delete Help Center
                                </Button>
                            )}
                        </ConfirmModalAction>
                    </div>
                </Route>
            </Switch>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterInstallationView
