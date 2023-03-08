import classNames from 'classnames'
import {identity} from 'lodash'
import React from 'react'
import {useHistory} from 'react-router-dom'
import {Container} from 'reactstrap'
import {ContactForm} from 'models/helpCenter/types'
import Button from 'pages/common/components/button/Button'
import {CONTACT_FORM_BASE_PATH} from 'pages/settings/contactForm/constants'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import SubjectLines from 'pages/settings/helpCenter/components/SubjectLines/SubjectLines'
import settingsCss from 'pages/settings/settings.less'

const ContactFormAppearance = (): JSX.Element => {
    const history = useHistory()
    const contactForm = useCurrentContactForm()
    const navigateToStartView = () => history.push(CONTACT_FORM_BASE_PATH)
    const subjectLines: ContactForm['subject_lines'] = {
        'en-US': {
            allow_other: false,
            options: contactForm.subject_lines.options['en-US'],
        },
    }

    // TODO: add handlers
    const onUpdateContactForm = identity
    const setIsDirty = identity

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <div className={settingsCss.contentWrapper}>
                <section>
                    <h2
                        className={classNames(
                            contactFormCss.sectionTitle,
                            contactFormCss.mbM
                        )}
                    >
                        Appearance
                    </h2>
                    <SubjectLines
                        title="Contact form subject"
                        description="Here is a default list of subject lines. If there is no subject added, the user can freely type any subject."
                        subjectLines={subjectLines}
                        currentLocale={'en-US'}
                        updateContactForm={onUpdateContactForm}
                        setIsDirty={setIsDirty}
                    />
                </section>
                <div className={contactFormCss.mtXl}>
                    <Button isDisabled>Save Changes</Button>
                    <Button
                        onClick={navigateToStartView}
                        className={contactFormCss.mlXs}
                        intent="secondary"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </Container>
    )
}

export default ContactFormAppearance
