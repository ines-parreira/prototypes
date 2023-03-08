import classNames from 'classnames'
import {identity} from 'lodash'
import {useHistory} from 'react-router-dom'
import React, {useMemo} from 'react'
import {Container} from 'reactstrap'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import InputField from 'pages/common/forms/input/InputField'
import Label from 'pages/common/forms/Label/Label'
import EmailIntegrationInputSection from 'pages/settings/contactForm/components/EmailIntegrationInputSection'
import {CONTACT_FORM_BASE_PATH} from 'pages/settings/contactForm/constants'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import css from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPreferences/ContactFormPreferences.less'
import {getNameValidationError} from 'pages/settings/helpCenter/utils/validations'
import settingsCss from 'pages/settings/settings.less'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

const ContactFormPreferences = (): JSX.Element => {
    const history = useHistory()
    const navigateToStartView = () => history.push(CONTACT_FORM_BASE_PATH)
    const contactForm = useCurrentContactForm()
    const domain: string = useAppSelector(getCurrentAccountState).get('domain')

    // TODO: finish handlers
    const onChangeEmailIntegration = identity
    const onChangeName = identity

    const nameError = useMemo(() => {
        return (
            (contactForm?.name && getNameValidationError(contactForm.name)) ||
            undefined
        )
    }, [contactForm.name])

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <div className={settingsCss.contentWrapper}>
                <section className={contactFormCss.mbM}>
                    <h2
                        className={classNames(
                            contactFormCss.sectionTitle,
                            contactFormCss.mbXxs
                        )}
                    >
                        Preferences
                    </h2>
                    <p>
                        Manage the name and email associated with your contact
                        form.
                    </p>
                </section>

                <section className={contactFormCss.mbS}>
                    <Label className={contactFormCss.mbXs}>
                        Contact form name
                    </Label>
                    <InputField
                        isRequired
                        type="text"
                        name="name"
                        placeholder={`${domain} Contact Form`}
                        value={contactForm.name}
                        onChange={onChangeName}
                        error={nameError}
                    />
                </section>

                <EmailIntegrationInputSection
                    onChange={onChangeEmailIntegration}
                    integration={contactForm.email_integration}
                />

                <div
                    className={classNames(
                        contactFormCss.mtXl,
                        css.bottomButtons
                    )}
                >
                    <div>
                        <Button>Save Changes</Button>
                        <Button
                            onClick={navigateToStartView}
                            className={contactFormCss.mlXs}
                            intent="secondary"
                        >
                            Cancel
                        </Button>
                    </div>

                    <Button intent="destructive">
                        <ButtonIconLabel icon="delete">
                            Delete Form
                        </ButtonIconLabel>
                    </Button>
                </div>
            </div>
        </Container>
    )
}

export default ContactFormPreferences
