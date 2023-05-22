import classNames from 'classnames'
import React from 'react'
import {
    Button,
    Container,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
} from 'reactstrap'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Label from 'pages/common/forms/Label/Label'
import useClipboard from 'pages/common/hooks/useClipboard'
import ContactFormInstallationCard from 'pages/settings/contactForm/components/ContactFormInstallationCard'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import settingsCss from 'pages/settings/settings.less'
import {
    logEvent,
    SegmentEvent,
} from '../../../../../../store/middlewares/segmentTracker'

const ContactFormPublish = (): JSX.Element => {
    const contactForm = useCurrentContactForm()
    const {copyButtonText} = useClipboard('#copy-shareable-link')

    const onCopyClick = () => {
        logEvent(SegmentEvent.HelpCenterContactFormCopyLink)
    }

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
                        Publish
                    </h2>
                    <p>
                        Display the contact form anywhere on your website using
                        a direct link or code.
                    </p>
                </section>

                <section>
                    <FormGroup className={contactFormCss.mbL}>
                        <Label
                            htmlFor="shareable-link"
                            className={contactFormCss.mbXs}
                        >
                            Shareable form link
                        </Label>
                        <InputGroup>
                            <Input
                                id="shareable-link"
                                type="text"
                                readOnly
                                defaultValue={contactForm.url_template}
                            />
                            <InputGroupAddon addonType="append">
                                <Button
                                    id="copy-shareable-link"
                                    data-clipboard-target="#shareable-link"
                                    onClick={onCopyClick}
                                >
                                    <ButtonIconLabel icon="content_copy">
                                        {copyButtonText}
                                    </ButtonIconLabel>
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                </section>

                <section>
                    <ContactFormInstallationCard
                        title="Manually embed to website"
                        code={contactForm.code_snippet_template}
                        alert={`Make sure to insert the code on <b>all pages</b> you wish to display the contact form.`}
                        description={`Use HTML to manually display the contact form on specific pages of your website. <br /> Note: You must have access to your site theme.`}
                        instructions={[
                            'Edit the source code of your website',
                            'Place the Contact Form code snippet within a <body> tag',
                            'Save the file and commit changes',
                        ]}
                    />
                </section>
            </div>
        </Container>
    )
}

export default ContactFormPublish
