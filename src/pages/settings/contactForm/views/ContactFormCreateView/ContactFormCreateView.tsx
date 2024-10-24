import {useQueryClient} from '@tanstack/react-query'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useState, useCallback} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {FeatureFlagKey} from 'config/featureFlags'
import {CreateContactFormDto} from 'models/contactForm/types'
import {LocaleCode} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import ContactFormNameInputSection from 'pages/settings/contactForm/components/ContactFormNameInputSection'
import LanguageInputSection from 'pages/settings/contactForm/components/LanguageInputSection'
import {
    CONTACT_FORM_CUSTOMIZATION_PATH,
    CONTACT_FORM_BASE_PATH,
    CONTACT_FORM_DEFAULT_LOCALE,
    CONTACT_FORM_DEFAULT_FORM_DISPLAY_MODE,
} from 'pages/settings/contactForm/constants'
import {useContactFormApi} from 'pages/settings/contactForm/hooks/useContactFormApi'
import {useEmailIntegrations} from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import settingsCss from 'pages/settings/settings.less'
import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {ConnectContactFormToShopSection} from '../../components/ConnectContactFormToShopSection/ConnectContactFormToShopSection'
import contactFormCss from '../../contactForm.less'
import {contactFormKeys, useCreateContactForm} from '../../queries'

const ContactFormCreateView = ({
    notify,
}: ConnectedProps<typeof connector>): JSX.Element => {
    const history = useHistory()
    const {defaultIntegration, emailIntegrations} = useEmailIntegrations()
    const {checkContactFormName, isReady} = useContactFormApi()
    const [isNameInvalid, setIsNameInvalid] = useState(false)
    const isContactFormNewEntrypointViewEnabled =
        useFlags()[FeatureFlagKey.ContactFormNewEntrypointView] || false
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
                form_display_mode: isContactFormNewEntrypointViewEnabled
                    ? CONTACT_FORM_DEFAULT_FORM_DISPLAY_MODE
                    : undefined,
            }
        })

    const queryClient = useQueryClient()
    const createContactFormMutation = useCreateContactForm({
        onSuccess: async (newContactForm) => {
            if (!newContactForm) {
                void notify({
                    message: 'Something went wrong',
                })
                return
            }
            // immediately navigate to the customization page with the success case
            navigateToContactFormCustomization(newContactForm.id)
            void notify({
                message: 'Contact Form successfully created',
                status: NotificationStatus.Success,
            })
            await queryClient.invalidateQueries(contactFormKeys.lists())
        },
        onError: () => {
            void notify({
                message: 'Failed to create the Contact Form',
                status: NotificationStatus.Error,
            })
        },
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

    const onSubmit = () => {
        if (createContactFormMutation.isLoading) return
        createContactFormMutation.mutate([undefined, createContactFormDto])
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
            <div className={settingsCss.pageContainer}>
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
                            isDisabled={
                                !isCreateButtonEnabled ||
                                createContactFormMutation.isLoading
                            }
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
            </div>
        </div>
    )
}

const connector = connect(null, {
    notify: notifyAction,
})

export default connector(ContactFormCreateView)
