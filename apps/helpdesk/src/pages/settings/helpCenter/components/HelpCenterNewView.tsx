/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { isAxiosError } from 'axios'
import classnames from 'classnames'
import { produce } from 'immer'
import _debounce from 'lodash/debounce'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import {
    LegacyButton as Button,
    LegacyLabel as Label,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import shopify from 'assets/img/integrations/shopify.png'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import type { CreateHelpCenterDto, LocaleCode } from 'models/helpCenter/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {
    isBaseEmailIntegration,
    isGenericEmailIntegration,
} from 'pages/integrations/integration/components/email/helpers'
import {
    helpCenterCreated,
    helpCenterUpdated,
} from 'state/entities/helpCenter/helpCenters/actions'
import * as integrationsSelectors from 'state/integrations/selectors'
import { notify as notifyAction } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { reportError } from 'utils/errors'

import { EMAIL_INTEGRATION_TYPES } from '../../../../constants/integration'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import { SubdomainInput } from '../components/SubdomainSection'
import {
    HELP_CENTER_BASE_PATH,
    HELP_CENTER_DEFAULT_COLOR,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_DEFAULT_THEME,
} from '../constants'
import { useEnableArticleRecommendation } from '../hooks/useEnableArticleRecommendation'
import { useAbilityChecker, useHelpCenterApi } from '../hooks/useHelpCenterApi'
import { useShopifyStoreWithChatConnectionsOptions } from '../hooks/useShopifyStoreWithChatConnectionsOptions'
import { useSupportedLocales } from '../providers/SupportedLocales'
import { getNewHelpCenterTranslation, slugify } from '../utils/helpCenter.utils'
import { getLocaleSelectOptions } from '../utils/localeSelectOptions'
import {
    getNameValidationError,
    getSubdomainValidationError,
    isValidSubdomain,
} from '../utils/validations'
import { LanguageBadgeTags } from './HelpCenterPreferencesView/components/AvailableLanguagesTags/LanguageBadgeTags'

import settingsCss from '../../settings.less'
import css from './HelpCenterNewView.less'

type Props = ConnectedProps<typeof connector>

const initialFormState: CreateHelpCenterDto = {
    name: '',
    subdomain: '',
    default_locale: HELP_CENTER_DEFAULT_LOCALE,
    theme: HELP_CENTER_DEFAULT_THEME,
    primary_color: HELP_CENTER_DEFAULT_COLOR,
    shop_name: undefined,
}

const HelpCenterNewView = ({
    notify,
    helpCenterCreated,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const location = useLocation()
    const locales = useSupportedLocales()
    const { hasAccess } = useAiAgentAccess()
    const shopifyShopsOptions = useShopifyStoreWithChatConnectionsOptions({
        option: css['select-option'],
        icon: css['shopify-icon'],
        connectedChatsCount: css['select-connected-chats'],
    })
    const { client } = useHelpCenterApi()
    const [isLoading, setIsLoading] = useState(false)
    const [isPristineSubdomain, setPristineSubdomain] = useState(true)
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(true)
    const disconnectButtonRef = useRef<HTMLSpanElement>(null)
    const enableArticleRecommendation = useEnableArticleRecommendation()
    const { isPassingRulesCheck } = useAbilityChecker()

    const [defaultLocale, setDefaultLocale] = useState(
        HELP_CENTER_DEFAULT_LOCALE,
    )
    const [availableLocales, setAvailableLocales] = useState([defaultLocale])

    const emailIntegrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
    ).filter(isGenericEmailIntegration)

    const defaultEmailIntegration =
        emailIntegrations.find(isBaseEmailIntegration) ?? emailIntegrations[0]

    const [newHelpCenter, setNewHelpCenter] = useState<CreateHelpCenterDto>({
        ...initialFormState,
        email_integration: {
            email: defaultEmailIntegration?.meta.address,
            id: defaultEmailIntegration?.id,
        },
    })

    const subdomainError = useMemo(
        () =>
            newHelpCenter?.subdomain
                ? getSubdomainValidationError(
                      newHelpCenter.subdomain,
                      isSubdomainAvailable,
                  )
                : null,
        [newHelpCenter.subdomain, isSubdomainAvailable],
    )

    const nameError = useMemo(
        () =>
            newHelpCenter?.name
                ? getNameValidationError(newHelpCenter.name)
                : undefined,
        [newHelpCenter.name],
    )!

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkSubdomainAvailability = useCallback(
        _debounce(async () => {
            if (
                client &&
                newHelpCenter.subdomain &&
                isValidSubdomain(newHelpCenter.subdomain)
            ) {
                try {
                    await client.checkHelpCenterWithSubdomainExists({
                        subdomain: newHelpCenter.subdomain,
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
        [newHelpCenter.subdomain],
    )

    const onChangeContactFormIntegration = useCallback(
        (integrationId: number | string) => {
            const selectedIntegration = emailIntegrations.find(
                (integration) => integration.id === integrationId,
            )

            if (selectedIntegration) {
                setNewHelpCenter((prev) => ({
                    ...prev,
                    email_integration: {
                        email: selectedIntegration.meta.address,
                        id: selectedIntegration.id,
                    },
                }))
            }
        },
        [emailIntegrations],
    )

    const handleChangeShopifyStore = useCallback(
        (value: string) => {
            if (value) {
                setNewHelpCenter((prevNewHelpCenter) => ({
                    ...prevNewHelpCenter,
                    shop_name: value,
                    self_service_deactivated: !hasAccess,
                }))

                return
            }

            setNewHelpCenter((prevNewHelpCenter) => ({
                ...prevNewHelpCenter,
                shop_name: undefined,
                self_service_deactivated: undefined,
            }))
        },
        [setNewHelpCenter, hasAccess],
    )

    const navigateToStartView = () =>
        history.push(location.pathname.split('/new')[0])

    const navigateToHelpCenterArticles = (id: number) =>
        history.push(`${location.pathname.split('/new')[0]}/${id}/articles`)

    const handleSubmit = async () => {
        if (!client) {
            return
        }

        setIsLoading(true)
        try {
            const payload = produce(newHelpCenter, (draft) => {
                if (draft.subdomain === '') {
                    delete draft.subdomain
                }
            })

            const otherLocales = availableLocales.filter(
                (locale) => locale !== defaultLocale,
            )

            const { data: createdHelpCenter } = await client.createHelpCenter(
                null,
                { ...payload, default_locale: defaultLocale },
            )

            helpCenterCreated(createdHelpCenter)
            if (isNaN(createdHelpCenter.id)) {
                navigateToStartView()
            } else {
                await Promise.all(
                    otherLocales.map((locale) =>
                        client.createHelpCenterTranslation(
                            {
                                help_center_id: createdHelpCenter.id,
                            },
                            getNewHelpCenterTranslation(locale),
                        ),
                    ),
                )

                dispatch(
                    helpCenterUpdated({
                        ...createdHelpCenter,
                        supported_locales: [defaultLocale, ...otherLocales],
                    }),
                )

                navigateToHelpCenterArticles(createdHelpCenter.id)
            }

            void enableArticleRecommendation(createdHelpCenter)
            void notify({
                message: 'Help Center created with success',
                status: NotificationStatus.Success,
            })
        } catch (err) {
            void notify({
                message: 'Failed to create the Help Center',
                status: NotificationStatus.Error,
            })
            reportError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangeName = (name: string) => {
        setNewHelpCenter((prevNewHelpCenter) => {
            if (!prevNewHelpCenter.subdomain) {
                setPristineSubdomain(true)
            }

            return {
                ...prevNewHelpCenter,
                name,
                subdomain:
                    isPristineSubdomain || !prevNewHelpCenter.subdomain
                        ? slugify(name)
                        : prevNewHelpCenter.subdomain,
            }
        })
    }

    const handleChangeSubdomain = (subdomain: string) => {
        setNewHelpCenter((prevNewHelpCenter) => ({
            ...prevNewHelpCenter,
            subdomain,
        }))

        if (isPristineSubdomain) {
            setPristineSubdomain(false)
        }
    }

    const canSubmit =
        isPassingRulesCheck(({ can }) => can('create', 'HelpCenterEntity')) &&
        newHelpCenter.name &&
        !subdomainError &&
        !nameError

    useEffect(() => {
        setIsSubdomainAvailable(true)

        void checkSubdomainAvailability()

        return () => checkSubdomainAvailability.cancel()
    }, [newHelpCenter.subdomain, checkSubdomainAvailability])

    if (isLoading) {
        return (
            <div className={settingsCss.pageContainer}>
                <Loader />
            </div>
        )
    }

    const shopifyIcon = (
        <img src={shopify} className={css['shopify-icon']} alt="shopify logo" />
    )

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={HELP_CENTER_BASE_PATH}>Help Center</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>New Help Center</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <div className={settingsCss.pageContainer}>
                <div className={settingsCss.contentWrapper}>
                    <section className={css.sectionNameSubdomain}>
                        <div>
                            <Label className={css.label} isRequired>
                                Help center name
                            </Label>
                            <IconTooltip className={css.iconTooltip}>
                                This is going to be displayed whenever your logo
                                isn’t available and also in search engines.
                            </IconTooltip>
                            <InputField
                                data-testid="name"
                                type="text"
                                name="name"
                                placeholder="e.g. My brand name"
                                isRequired
                                value={newHelpCenter.name}
                                onChange={handleChangeName}
                                error={nameError}
                            />
                        </div>
                        <SubdomainInput
                            value={newHelpCenter.subdomain}
                            onChange={handleChangeSubdomain}
                            tooltip="This is the URL for your Help Center. If you don't provide a value, we will generate one for you."
                            error={subdomainError}
                        />
                    </section>

                    <section className={css.sectionPart}>
                        <label className="control-label">
                            Available languages
                        </label>
                        <LanguageBadgeTags
                            availableLanguages={availableLocales}
                            availableLocales={locales}
                            defaultLanguage={defaultLocale}
                            updateAvailableLanguages={setAvailableLocales}
                            showModalQuestion={false}
                        />
                    </section>

                    {availableLocales.length > 1 && (
                        <section className={css.sectionPart}>
                            <label className="control-label">
                                Default language
                            </label>
                            <SelectField
                                options={getLocaleSelectOptions(
                                    locales,
                                    availableLocales,
                                )}
                                fullWidth
                                value={defaultLocale}
                                onChange={(newLocale) => {
                                    // TODO: SelectField can be made generic so that we can
                                    // remove the type assertion
                                    setDefaultLocale(newLocale as LocaleCode)
                                }}
                                caption="Used when selected language isn't available or cannot be detected."
                            />
                        </section>
                    )}

                    <section className={css.sectionPart}>
                        <label className="control-label" htmlFor="contactForm">
                            Email integration
                        </label>
                        <SelectField
                            id="contactForm"
                            placeholder="Select an email integration"
                            value={newHelpCenter?.email_integration?.id}
                            options={emailIntegrations.map((integration) => ({
                                label:
                                    `${integration.name} ` +
                                    `<${integration.meta.address}>`,
                                value: integration.id,
                            }))}
                            fullWidth
                            onChange={(integrationId) =>
                                onChangeContactFormIntegration(integrationId)
                            }
                            className={css.selectEmailIntegration}
                            icon="email"
                            caption="Select the email to receive inquiries from Contact Form."
                        />
                    </section>

                    <section className={css.sectionPart}>
                        <label className="control-label">Shopify store</label>

                        {newHelpCenter.shop_name ? (
                            <div className={css['connected-store']}>
                                <img
                                    src={shopify}
                                    className={css['shopify-icon']}
                                    alt="shopify logo"
                                />

                                <span className={css['store-name']}>
                                    {newHelpCenter.shop_name}
                                </span>

                                <span
                                    className={classnames(
                                        'ml-auto',
                                        css['disconnect-button'],
                                    )}
                                    ref={disconnectButtonRef}
                                    onClick={() => handleChangeShopifyStore('')}
                                >
                                    <i className="material-icons">delete</i>
                                </span>

                                <Tooltip
                                    placement="top"
                                    target={disconnectButtonRef}
                                >
                                    Disconnect help center from this store
                                </Tooltip>
                            </div>
                        ) : (
                            <SelectField
                                fullWidth
                                aria-label="Select store"
                                placeholder="Select store"
                                customIcon={shopifyIcon}
                                options={shopifyShopsOptions}
                                value={newHelpCenter?.shop_name}
                                onChange={(value) => {
                                    // this type cast is safe as all values are string
                                    handleChangeShopifyStore(value as string)
                                }}
                                caption="Connect this Help Center to a Shopify store to enable AI Agent features."
                            />
                        )}
                    </section>

                    <div className={classnames('d-flex', css['bottomButtons'])}>
                        <Button isDisabled={!canSubmit} onClick={handleSubmit}>
                            Add Help Center
                        </Button>
                        <Button
                            className={css.cancelButton}
                            intent="secondary"
                            onClick={navigateToStartView}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const connector = connect(null, {
    helpCenterCreated,
    notify: notifyAction,
})

export default connector(HelpCenterNewView)
