import classnames from 'classnames'
import React, {useMemo, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import {validLocaleCode} from 'models/helpCenter/utils'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import InputField from 'pages/common/forms/input/InputField'
import Label from 'pages/common/forms/Label/Label'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Value} from 'pages/common/forms/SelectField/types'
import {
    isBaseEmailIntegration,
    isGenericEmailIntegration,
} from 'pages/integrations/integration/components/email/helpers'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getNameValidationError} from 'pages/settings/helpCenter/utils/validations'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import * as integrationsSelectors from 'state/integrations/selectors'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'
import settingsCss from '../../../settings.less'
import {
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_DEFAULT_LOCALE,
    CONTACT_FORM_SETTINGS_PATH,
} from '../../constants'
import css from './ContactFormCreateView.less'
import {CreateContactFormParams} from './ContactFormCreateView.types'

const emailIntegrationsSelector = integrationsSelectors.getIntegrationsByTypes(
    EMAIL_INTEGRATION_TYPES
)

const ContactFormCreateView = ({
    notify,
}: ConnectedProps<typeof connector>): JSX.Element => {
    const history = useHistory()
    const locales = useSupportedLocales()
    const domain: string = useAppSelector(getCurrentAccountState).get('domain')
    const integrations = useAppSelector(emailIntegrationsSelector)
    const emailIntegrations = integrations.filter(isGenericEmailIntegration)

    const [isLoading, setIsLoading] = useState(false)
    const [isAlertAcknowledged, setIsAlertAcknowledged] = useState(false)
    const [newContactForm, setNewContactForm] =
        useState<CreateContactFormParams>(() => {
            const defaultEmailIntegration =
                emailIntegrations.find(isBaseEmailIntegration) ??
                emailIntegrations[0]

            return {
                name: `${domain} Contact Form`,
                default_locale: CONTACT_FORM_DEFAULT_LOCALE,
                email_integration: {
                    id: defaultEmailIntegration.id,
                    email: defaultEmailIntegration.meta.address,
                },
            }
        })

    const navigateToStartView = () => history.push(CONTACT_FORM_BASE_PATH)
    const navigateToContactFormAppearance = () =>
        history.push(CONTACT_FORM_SETTINGS_PATH)

    const onInfoClose = () => setIsAlertAcknowledged(true)

    const onChangeName = (name: string) => {
        setNewContactForm((prev) => ({
            ...prev,
            name,
        }))
    }

    const onChangeEmail = (integrationId: Value) => {
        const selectedIntegration = emailIntegrations.find(
            (integration) => integration.id === integrationId
        )

        if (!selectedIntegration) return

        setNewContactForm((prev) => ({
            ...prev,
            email_integration: {
                id: selectedIntegration.id,
                email: selectedIntegration.meta.address,
            },
        }))
    }

    const onChangeLocale = (locale: Value) => {
        setNewContactForm((prev) => ({
            ...prev,
            default_locale: validLocaleCode(locale),
        }))
    }

    const onSubmit = () => {
        setIsLoading(true)
        try {
            navigateToContactFormAppearance()
            void notify({
                message: 'Contact Form successfully created',
                status: NotificationStatus.Success,
            })
        } catch (err) {
            void notify({
                message: 'Failed to create the Contact Form',
                status: NotificationStatus.Error,
            })
            reportError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }

    const localeOptions = useMemo(() => {
        return locales.map(({name, code}) => ({
            label: name,
            value: code,
        }))
    }, [locales])

    const emailOptions = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            label: `${integration.name} ` + `<${integration.meta.address}>`,
            value: integration.id,
        }))
    }, [emailIntegrations])

    const nameError = useMemo(() => {
        return (
            (newContactForm?.name &&
                getNameValidationError(newContactForm.name)) ||
            undefined
        )
    }, [newContactForm.name])

    const isCreateButtonEnabled = newContactForm.name && !nameError

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
                            <Link to={CONTACT_FORM_BASE_PATH}>
                                Contact Form
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>New Contact Form</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={settingsCss.pageContainer}>
                <div
                    className={classnames(
                        css.container,
                        settingsCss.contentWrapper
                    )}
                >
                    <section>
                        <Label isRequired>Contact form name</Label>
                        <InputField
                            isRequired
                            data-testid="name"
                            type="text"
                            name="name"
                            placeholder={`${domain} Contact Form`}
                            value={newContactForm.name}
                            onChange={onChangeName}
                            error={nameError}
                        />
                    </section>

                    {!isAlertAcknowledged && (
                        <section>
                            <Alert
                                icon
                                data-testid="alert"
                                type={AlertType.Info}
                                onClose={onInfoClose}
                            >
                                The default Gorgias email is selected. Make sure
                                to set the desired email for your form.
                            </Alert>
                        </section>
                    )}

                    <section>
                        <Label isRequired htmlFor="email-select">
                            Select email that will receive form submissions
                        </Label>
                        <SelectField
                            required
                            fullWidth
                            id="email-select"
                            placeholder="Select an email integration"
                            value={newContactForm.email_integration.id}
                            options={emailOptions}
                            onChange={onChangeEmail}
                            icon="email"
                        />
                    </section>

                    <section>
                        <Label isRequired htmlFor="locale-select">
                            Select form language
                        </Label>
                        <SelectField
                            required
                            fullWidth
                            id="locale-select"
                            value={newContactForm.default_locale}
                            options={localeOptions}
                            onChange={onChangeLocale}
                        />
                    </section>

                    <div className={css.bottomButtons}>
                        <Button
                            isDisabled={!isCreateButtonEnabled}
                            onClick={onSubmit}
                        >
                            Create Contact Form
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
    notify: notifyAction,
})

export default connector(ContactFormCreateView)
