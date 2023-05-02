import classnames from 'classnames'
import React, {useState, useCallback} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import EmailIntegrationInputSection from 'pages/settings/contactForm/components/EmailIntegrationInputSection'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import {
    isBaseEmailIntegration,
    isGenericEmailIntegration,
} from 'pages/integrations/integration/components/email/helpers'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import * as integrationsSelectors from 'state/integrations/selectors'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import settingsCss from 'pages/settings/settings.less'
import {
    CONTACT_FORM_APPEARANCE_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_DEFAULT_LOCALE,
} from 'pages/settings/contactForm/constants'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import {
    ContactFormIntegration,
    CreateContactFormDto,
} from 'models/contactForm/types'
import ContactFormNameInputSection from 'pages/settings/contactForm/components/ContactFormNameInputSection'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import LanguageInputSection from 'pages/settings/contactForm/components/LanguageInputSection'
import {LocaleCode} from 'models/helpCenter/types'
import contactFormCss from '../../contactForm.less'

const emailIntegrationsSelector = integrationsSelectors.getIntegrationsByTypes(
    EMAIL_INTEGRATION_TYPES
)

const ContactFormCreateView = ({
    notify,
}: ConnectedProps<typeof connector>): JSX.Element => {
    const history = useHistory()
    const domain: string = useAppSelector(getCurrentAccountState).get('domain')
    const integrations = useAppSelector(emailIntegrationsSelector)
    const emailIntegrations = integrations.filter(isGenericEmailIntegration)
    const {checkContactFormName, createContactForm, isReady, isLoading} =
        useContactFormApi()
    const [isAlertAcknowledged, setIsAlertAcknowledged] = useState(false)
    const [isNameInvalid, setIsNameInvalid] = useState(false)
    const [createContactFormDto, setCreateContactFormDto] =
        useState<CreateContactFormDto>(() => {
            const defaultEmailIntegration =
                emailIntegrations.find(isBaseEmailIntegration) ??
                emailIntegrations[0]

            return {
                name: `${domain} Contact Form`,
                help_center_id: null,
                default_locale: CONTACT_FORM_DEFAULT_LOCALE,
                email_integration: {
                    id: defaultEmailIntegration.id,
                    email: defaultEmailIntegration.meta.address,
                },
            }
        })

    const navigateToStartView = useCallback(
        () => history.push(CONTACT_FORM_BASE_PATH),
        [history]
    )

    const navigateToContactFormAppearance = useCallback(
        (contactFormId: number) => {
            return history.push(
                insertContactFormIdParam(
                    CONTACT_FORM_APPEARANCE_PATH,
                    contactFormId
                )
            )
        },
        [history]
    )

    const onInfoClose = () => setIsAlertAcknowledged(true)

    const onChangeName = (name: string) => {
        setCreateContactFormDto((prev) => ({
            ...prev,
            name,
        }))
    }

    const onChangeEmailIntegration = (integration: ContactFormIntegration) => {
        setCreateContactFormDto((prev) => ({
            ...prev,
            email_integration: {
                id: integration.id,
                email: integration.meta.address,
            },
        }))
    }

    const onChangeLocale = (locale: LocaleCode) => {
        setCreateContactFormDto((prev) => ({
            ...prev,
            default_locale: locale,
        }))
    }

    const onSubmit = async () => {
        if (!isReady) return

        try {
            const contactForm = await createContactForm(createContactFormDto)
            navigateToContactFormAppearance(contactForm.id)
            void notify({
                message: 'Contact Form successfully created',
                status: NotificationStatus.Success,
            })
        } catch (err) {
            void notify({
                message: 'Failed to create the Contact Form',
                status: NotificationStatus.Error,
            })
        }
    }

    const isCreateButtonEnabled =
        createContactFormDto.name.length > 1 &&
        createContactFormDto.email_integration &&
        createContactFormDto.default_locale !== undefined &&
        !isNameInvalid &&
        !isLoading

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
                        contactFormCss.sectionContainer,
                        settingsCss.contentWrapper
                    )}
                >
                    <section className={contactFormCss.mbS}>
                        <ContactFormNameInputSection
                            isRequiredShown={true}
                            checkContactFormName={checkContactFormName}
                            isApiReady={isReady}
                            onChange={onChangeName}
                            setIsNameInvalid={setIsNameInvalid}
                            contactFormName={createContactFormDto.name}
                            domain={domain}
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
                        <EmailIntegrationInputSection
                            isRequiredShown
                            onChange={onChangeEmailIntegration}
                            emailIntegrationId={
                                createContactFormDto.email_integration.id
                            }
                            customLabel={
                                'Select email that will receive form submissions'
                            }
                        />
                    </section>

                    <section>
                        <LanguageInputSection
                            locale={createContactFormDto.default_locale}
                            onChange={onChangeLocale}
                            customLabel={'Select default language'}
                        />
                    </section>

                    <div className={contactFormCss.mtXl}>
                        <Button
                            isDisabled={!isCreateButtonEnabled}
                            onClick={onSubmit}
                        >
                            Create Contact Form
                        </Button>
                        <Button
                            className={contactFormCss.mlXs}
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
