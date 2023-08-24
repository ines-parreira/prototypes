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
import {Route, Switch} from 'react-router-dom'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Label from 'pages/common/forms/Label/Label'
import useClipboard from 'pages/common/hooks/useClipboard'
import ContactFormManualEmbedCard from 'pages/settings/contactForm/components/ContactFormManualEmbedCard'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import settingsCss from 'pages/settings/settings.less'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {useGetPageEmbedments} from 'pages/settings/contactForm/queries'
import Loader from 'pages/common/components/Loader/Loader'
import {
    CONTACT_FORM_MANAGE_EMBEDMENTS_PATH,
    CONTACT_FORM_PUBLISH_PATH,
} from 'pages/settings/contactForm/constants'
import BackLink from 'pages/settings/contactForm/components/BackLink/BackLink'
import ContactFormAutoEmbedPublishSection from '../../../components/ContactFormAutoEmbedPublishSection'

const ContactFormPublish = (): JSX.Element => {
    const contactForm = useCurrentContactForm()
    const getPageEmbedments = useGetPageEmbedments(contactForm.id)
    const {copyButtonText} = useClipboard('#copy-shareable-link')

    const onCopyClick = () => {
        logEvent(SegmentEvent.HelpCenterContactFormCopyLink)
    }

    if (getPageEmbedments.isLoading && !getPageEmbedments.isFetched) {
        return <Loader />
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Switch>
                <Route exact path={CONTACT_FORM_MANAGE_EMBEDMENTS_PATH}>
                    <BackLink contactFormId={contactForm.id} />
                </Route>
                <Route exact path={CONTACT_FORM_PUBLISH_PATH}>
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
                                Display the contact form anywhere on your
                                website.
                            </p>
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
                            pageEmbedments={getPageEmbedments.data ?? []}
                        />

                        <section>
                            <ContactFormManualEmbedCard
                                codeSnippet={contactForm.code_snippet_template}
                                shopName={contactForm.shop_name}
                            />
                        </section>
                    </div>
                </Route>
            </Switch>
        </Container>
    )
}

export default ContactFormPublish
