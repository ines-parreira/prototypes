import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import axios from 'axios'
import classnames from 'classnames'
import produce from 'immer'
import _debounce from 'lodash/debounce'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useHistory, useLocation} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'

import shopify from 'assets/img/integrations/shopify.png'

import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'

import {CreateHelpCenterDto} from 'models/helpCenter/types'
import {validLocaleCode} from 'models/helpCenter/utils'
import {helpCenterCreated} from 'state/entities/helpCenter/helpCenters/actions'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import InputField from 'pages/common/forms/input/InputField'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import Tooltip from 'pages/common/components/Tooltip'
import Label from 'pages/common/forms/Label/Label'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {SubdomainInput} from '../components/SubdomainSection'
import {
    HELP_CENTER_BASE_PATH,
    HELP_CENTER_DEFAULT_COLOR,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_DEFAULT_THEME,
} from '../constants'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useSupportedLocales} from '../providers/SupportedLocales'
import {HelpCenterTheme} from '../types'
import {slugify} from '../utils/helpCenter.utils'
import {localeToSelectOption} from '../utils/localeSelectOptions'
import {
    getNameValidationError,
    getSubdomainValidationError,
    isValidSubdomain,
} from '../utils/validations'

import {useShopifyStoreWithChatConnectionsOptions} from '../hooks/useShopifyStoreWithChatConnectionsOptions'

import settingsCss from '../../settings.less'

import {useEnableArticleRecommendation} from '../hooks/useEnableArticleRecommendation'
import {ThemeSwitch} from './ThemeSwitch'

import css from './HelpCenterNewView.less'

type Props = ConnectedProps<typeof connector>

type CreateHelpCenterPayload = CreateHelpCenterDto & {
    theme: HelpCenterTheme
    primary_color: string
}

const initialFormState: CreateHelpCenterPayload = {
    name: '',
    subdomain: '',
    default_locale: HELP_CENTER_DEFAULT_LOCALE,
    theme: HELP_CENTER_DEFAULT_THEME,
    primary_color: HELP_CENTER_DEFAULT_COLOR,
    shop_name: undefined,
}

export const HelpCenterNewView = ({
    notify,
    helpCenterCreated,
}: Props): JSX.Element => {
    const history = useHistory()
    const location = useLocation()
    const locales = useSupportedLocales()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const shopifyShopsOptions = useShopifyStoreWithChatConnectionsOptions({
        option: css['select-option'],
        icon: css['shopify-icon'],
        connectedChatsCount: css['select-connected-chats'],
    })
    const {client} = useHelpCenterApi()
    const [newHelpCenter, setNewHelpCenter] =
        useState<CreateHelpCenterPayload>(initialFormState)
    const [isLoading, setIsLoading] = useState(false)
    const [isPristineSubdomain, setPristineSubdomain] = useState(true)
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(true)
    const disconnectButtonRef = useRef<HTMLSpanElement>(null)
    const enableArticleRecommendation = useEnableArticleRecommendation(notify)

    const localeOptions = useMemo(
        () => locales.map(localeToSelectOption),
        [locales]
    )

    const subdomainError = useMemo(
        () =>
            newHelpCenter?.subdomain
                ? getSubdomainValidationError(
                      newHelpCenter.subdomain,
                      isSubdomainAvailable
                  )
                : null,
        [newHelpCenter.subdomain, isSubdomainAvailable]
    )

    const nameError = useMemo(
        () =>
            newHelpCenter?.name
                ? getNameValidationError(newHelpCenter.name)
                : undefined,
        [newHelpCenter.name]
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
                    if (
                        axios.isAxiosError(err) &&
                        err.response?.status === 404
                    ) {
                        setIsSubdomainAvailable(true)
                    } else {
                        throw err
                    }
                }
            }
        }, 500),
        [newHelpCenter.subdomain]
    )

    const handleChangeShopifyStore = useCallback(
        (value: string) => {
            if (value) {
                setNewHelpCenter((prevNewHelpCenter) => ({
                    ...prevNewHelpCenter,
                    shop_name: value,
                    self_service_deactivated: !hasAutomationAddOn,
                }))

                return
            }

            setNewHelpCenter((prevNewHelpCenter) => ({
                ...prevNewHelpCenter,
                shop_name: undefined,
                self_service_deactivated: undefined,
            }))
        },
        [setNewHelpCenter, hasAutomationAddOn]
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
            const {data: createdHelpCenter} = await client.createHelpCenter(
                null,
                payload
            )

            helpCenterCreated(createdHelpCenter)
            if (isNaN(createdHelpCenter.id)) {
                navigateToStartView()
            } else {
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
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOnSelect = (value: React.ReactText) => {
        setNewHelpCenter((prevNewHelpCenter) => ({
            ...prevNewHelpCenter,
            default_locale: validLocaleCode(value),
        }))
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

    const canSubmit = useMemo(
        () => newHelpCenter.name && !subdomainError && !nameError,
        [newHelpCenter, subdomainError, nameError]
    )

    useEffect(() => {
        setIsSubdomainAvailable(true)

        void checkSubdomainAvailability()

        return () => checkSubdomainAvailability.cancel()
    }, [newHelpCenter.subdomain, checkSubdomainAvailability])

    if (isLoading) {
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <Loader />
            </Container>
        )
    }

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
            <Container fluid className={settingsCss.pageContainer}>
                <div className={settingsCss.contentWrapper}>
                    <section className={css.form}>
                        <div>
                            <Label className={css.label}>
                                Help Center name
                            </Label>
                            <IconTooltip className={css.iconTooltip}>
                                This is going to be displayed whenever your logo
                                isn’t available and also in search engines.
                            </IconTooltip>
                            <InputField
                                data-testid="name"
                                type="text"
                                name="name"
                                placeholder="Ex. Customer Support"
                                className={classnames(css.formInput)}
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

                    <section>
                        <h3>Languages</h3>
                        <h4>Default language</h4>
                        <p>
                            Choose a default language. This will be the default
                            setting when the selected language isn't available
                            or cannot be detected.
                        </p>
                        <div id="language-select">
                            <SelectField
                                options={localeOptions}
                                value={newHelpCenter.default_locale}
                                onChange={handleOnSelect}
                                fullWidth
                            />
                        </div>
                    </section>

                    <section>
                        <h3 className="mb-3">Appearance</h3>
                        <ThemeSwitch
                            selectedTheme={newHelpCenter.theme}
                            currentColor={newHelpCenter.primary_color}
                            onThemeChange={(theme) => {
                                setNewHelpCenter((prevNewHelpCenter) => ({
                                    ...prevNewHelpCenter,
                                    theme,
                                }))
                            }}
                            onColorChange={(color) => {
                                setNewHelpCenter((prevNewHelpCenter) => ({
                                    ...prevNewHelpCenter,
                                    primary_color: color,
                                }))
                            }}
                        />
                    </section>

                    <section>
                        <h3 style={{marginBottom: 4}}>
                            Connect to Shopify store
                        </h3>
                        <p>
                            Connect this Help Center to a Shopify store to
                            enable Self-service flows.
                            {hasAutomationAddOn && (
                                <span>
                                    {' '}
                                    Note that this will automatically enable
                                    Self-service.
                                </span>
                            )}
                        </p>

                        {newHelpCenter?.shop_name ? (
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
                                        css['disconnect-button']
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
                                options={shopifyShopsOptions}
                                value={newHelpCenter?.shop_name}
                                onChange={(value) => {
                                    // this type cast is safe as all values are string
                                    handleChangeShopifyStore(value as string)
                                }}
                            />
                        )}
                    </section>

                    <div className="d-flex">
                        <Button isDisabled={!canSubmit} onClick={handleSubmit}>
                            Add new Help Center
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
            </Container>
        </div>
    )
}

const connector = connect(null, {
    helpCenterCreated,
    notify: notifyAction,
})

export default connector(HelpCenterNewView)
