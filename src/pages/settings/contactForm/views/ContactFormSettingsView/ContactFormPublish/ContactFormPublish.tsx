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
import {useFlags} from 'launchdarkly-react-client-sdk'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Label from 'pages/common/forms/Label/Label'
import useClipboard from 'pages/common/hooks/useClipboard'
import ContactFormInstallationCard from 'pages/settings/contactForm/components/ContactFormInstallationCard'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import settingsCss from 'pages/settings/settings.less'
import {FeatureFlagKey} from 'config/featureFlags'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import ContactFormAutoEmbedInstallationCard from 'pages/settings/contactForm/components/ContactFormAutoEmbedInstallationCard'

const ContactFormPublish = (): JSX.Element => {
    const contactForm = useCurrentContactForm()
    const {copyButtonText} = useClipboard('#copy-shareable-link')

    const onCopyClick = () => {
        logEvent(SegmentEvent.HelpCenterContactFormCopyLink)
    }

    const isAutoEmbedFlagActive: boolean =
        useFlags()[FeatureFlagKey.ContactFormAutoEmbed] ?? false

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
                    <p>Display the contact form anywhere on your website.</p>
                </section>

                <section>
                    <FormGroup className={contactFormCss.mbL}>
                        <Label
                            htmlFor="shareable-link"
                            className={contactFormCss.mbXs}
                        >
                            Shareable link
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
                        title="Manually embed with code"
                        code={contactForm.code_snippet_template}
                        alert={`Make sure to insert the code on <b>all pages</b> you wish to display the contact form.`}
                        description={`Use HTML to manually display the contact form on specific pages of your website. <br /> Note: You must have access to your site theme.`}
                        instructions={[
                            'Edit the source code of your website',
                            'Add the code snippet anywhere between <body> and </body> where you want your Contact Form to be displayed on the page',
                            'Save the file and commit changes',
                        ]}
                    />
                </section>

                {isAutoEmbedFlagActive ? (
                    <section>
                        <ContactFormAutoEmbedInstallationCard />
                    </section>
                ) : null}
            </div>
        </Container>
    )
}

export default ContactFormPublish
