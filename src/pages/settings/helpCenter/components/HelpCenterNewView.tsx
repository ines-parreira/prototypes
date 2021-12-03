import React, {useCallback, useEffect, useMemo, useState} from 'react'
import axios from 'axios'
import classnames from 'classnames'
import produce from 'immer'
import _debounce from 'lodash/debounce'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useHistory, useLocation} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Button, Container} from 'reactstrap'

import {CreateHelpCenterDto} from '../../../../models/helpCenter/types'
import {validLocaleCode} from '../../../../models/helpCenter/utils'
import {helpCenterCreated} from '../../../../state/entities/helpCenters/actions'
import {notify as notifyAction} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import InputField from '../../../common/forms/InputField.js'
import SelectField from '../../../common/forms/SelectField/SelectField'
import {SubdomainInput} from '../components/SubdomainSection'
import {
    HELP_CENTER_BASE_PATH,
    HELP_CENTER_DEFAULT_COLOR,
    HELP_CENTER_DEFAULT_LOCALE,
    HELP_CENTER_DEFAULT_THEME,
} from '../constants'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useLocales} from '../hooks/useLocales'
import {HelpCenterTheme} from '../types'
import {slugify} from '../utils/helpCenter.utils'
import {localeToSelectOption} from '../utils/localeSelectOptions'
import {
    getSubdomainValidationError,
    isValidSubdomain,
} from '../utils/validations'
import settingsCss from '../../settings.less'

import {PageContainer} from './PageContainer'
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
}

export const HelpCenterNewView = ({
    notify,
    helpCenterCreated,
}: Props): JSX.Element => {
    const history = useHistory()
    const location = useLocation()
    const locales = useLocales()
    const {client} = useHelpCenterApi()
    const [newHelpCenter, setNewHelpCenter] =
        useState<CreateHelpCenterPayload>(initialFormState)
    const [isLoading, setIsLoading] = useState(false)
    const [isPristineSubdomain, setPristineSubdomain] = useState(true)
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(true)
    const localeOptions = locales.map(localeToSelectOption)

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

    const navigateToStartView = () =>
        history.push(location.pathname.split('/new')[0])

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
            navigateToStartView()

            void notify({
                message: 'Help Center successfully created',
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
        () => newHelpCenter.name && !subdomainError,
        [newHelpCenter, subdomainError]
    )

    useEffect(() => {
        setIsSubdomainAvailable(true)

        void checkSubdomainAvailability()

        return () => checkSubdomainAvailability.cancel()
    }, [newHelpCenter.subdomain, checkSubdomainAvailability])

    if (isLoading) {
        return (
            <Container fluid className="page-container">
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
            <PageContainer className={settingsCss.pageContainer}>
                <section className={css.form}>
                    <InputField
                        type="text"
                        name="name"
                        label="Help Center name"
                        tooltip="This is going to be displayed whenever your logo isn’t available and also in search engines."
                        placeholder="Ex. Customer Support"
                        className={classnames(css.formInput)}
                        required
                        value={newHelpCenter.name}
                        onChange={handleChangeName}
                    />
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
                        setting when the selected language isn't available or
                        cannot be detected.
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

                <div className="d-flex">
                    <Button
                        color="success"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                    >
                        Add new Help Center
                    </Button>
                    <Button
                        className={css.cancelButton}
                        onClick={navigateToStartView}
                    >
                        Cancel
                    </Button>
                </div>
            </PageContainer>
        </div>
    )
}

const connector = connect(null, {
    helpCenterCreated,
    notify: notifyAction,
})

export default connector(HelpCenterNewView)
