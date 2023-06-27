import classnames from 'classnames'
import React, {useState, useCallback} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import settingsCss from 'pages/settings/settings.less'
import {
    CONTACT_FORM_CUSTOMIZATION_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_DEFAULT_LOCALE,
} from 'pages/settings/contactForm/constants'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import {CreateContactFormDto} from 'models/contactForm/types'
import ContactFormNameInputSection from 'pages/settings/contactForm/components/ContactFormNameInputSection'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import LanguageInputSection from 'pages/settings/contactForm/components/LanguageInputSection'
import {LocaleCode} from 'models/helpCenter/types'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import contactFormCss from '../../contactForm.less'
import {ConnectContactFormToShopSection} from '../../components/ConnectContactFormToShopSection/ConnectContactFormToShopSection'

const ContactFormCreateView = ({
    notify,
}: ConnectedProps<typeof connector>): JSX.Element => {
    const history = useHistory()
    const {defaultIntegration, emailIntegrations} = useEmailIntegrations()
    const {checkContactFormName, createContactForm, isReady, isLoading} =
        useContactFormApi()
    const [isNameInvalid, setIsNameInvalid] = useState(false)
    const [createContactFormDto, setCreateContactFormDto] =
        useState<CreateContactFormDto>(() => {
            const integration = defaultIntegration ?? emailIntegrations[0]
            return {
                name: '',
                default_locale: CONTACT_FORM_DEFAULT_LOCALE,
                email_integration: {
                    id: integration.id,
                    email: integration.meta.address,
                },
            }
        })
    const navigateToStartView = useCallback(
        () => history.push(CONTACT_FORM_BASE_PATH),
        [history]
    )

    const navigateToContactFormCustomization = useCallback(
        (contactFormId: number) => {
            return history.push(
                insertContactFormIdParam(
                    CONTACT_FORM_CUSTOMIZATION_PATH,
                    contactFormId
                )
            )
        },
        [history]
    )

    const onChangeName = (name: string) => {
        setCreateContactFormDto((prev) => ({
            ...prev,
            name,
        }))
    }

    const onChangeShopName = ({shop_name}: {shop_name: string | null}) => {
        setCreateContactFormDto((prev) => ({
            ...prev,
            shop_name,
        }))
    }

    const onChangeLocale = (locale: LocaleCode) => {
        setCreateContactFormDto((prev) => ({
            ...prev,
            default_locale: locale,
        }))
    }

    const onSubmit = async () => {
        if (!isReady && !isLoading) return

        try {
            const contactForm = await createContactForm(createContactFormDto)
            navigateToContactFormCustomization(contactForm.id)
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
        !isNameInvalid

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
                            isNameCheckEnabled={
                                !!createContactFormDto.name.length
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

                    <section>
                        <ConnectContactFormToShopSection
                            shopName={null}
                            onUpdate={onChangeShopName}
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
