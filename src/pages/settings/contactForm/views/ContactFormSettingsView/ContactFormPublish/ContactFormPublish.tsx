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
import ContactFormManualEmbedCard from 'pages/settings/contactForm/components/ContactFormManualEmbedCard'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import settingsCss from 'pages/settings/settings.less'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import ContactFormAutoEmbedPublishSection from '../../../components/ContactFormAutoEmbedPublishSection'

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

                <ContactFormAutoEmbedPublishSection
                    contactFormId={contactForm.id}
                    contactFormShopName={contactForm.shop_name}
                />

                <section>
                    <ContactFormManualEmbedCard
                        codeSnippet={contactForm.code_snippet_template}
                        shopName={contactForm.shop_name}
                    />
                </section>
            </div>
        </Container>
    )
}

export default ContactFormPublish
