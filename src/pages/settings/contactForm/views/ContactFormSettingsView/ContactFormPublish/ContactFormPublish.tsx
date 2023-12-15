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

import {useFlags} from 'launchdarkly-react-client-sdk'
import {logEvent, SegmentEvent} from 'common/segment'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Label from 'pages/common/forms/Label/Label'
import useClipboard from 'pages/common/hooks/useClipboard'
import ContactFormManualEmbedCard from 'pages/settings/contactForm/components/ContactFormManualEmbedCard'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {useCurrentContactForm} from 'pages/settings/contactForm/hooks/useCurrentContactForm'
import settingsCss from 'pages/settings/settings.less'
import {useGetPageEmbedments} from 'pages/settings/contactForm/queries'
import {
    CONTACT_FORM_MANAGE_EMBEDMENTS_PATH,
    CONTACT_FORM_PUBLISH_PATH,
} from 'pages/settings/contactForm/constants'
import BackLink from 'pages/common/components/BackLink'
import ManageEmbedments from 'pages/settings/contactForm/views/ContactFormSettingsView/ContactFormPublish/ManageEmbedments/ManageEmbedments'
import {useIsShopifyCredentialsWorking} from 'pages/settings/contactForm/hooks/useIsShopifyCredentialsWorking'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import ContactFormAutoEmbedPublishSection from '../../../components/ContactFormAutoEmbedPublishSection'
import {FeatureFlagKey} from '../../../../../../config/featureFlags'
import ContactFormMailtoReplacementSection from '../../../components/ContactFormMailtoReplacementSection/ContactFormMailtoReplacementSection'

const ContactFormPublish = (): JSX.Element => {
    const contactForm = useCurrentContactForm()
    const getPageEmbedments = useGetPageEmbedments(contactForm.id, {
        enabled: Boolean(contactForm.shop_name),
    })
    const {copyButtonText} = useClipboard('#copy-shareable-link')
    const isHelpCenterAnalyticsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.HelpCenterReplaceMailtoLink]

    const {isWorking, isLoading} = useIsShopifyCredentialsWorking()

    const onCopyClick = () => {
        logEvent(SegmentEvent.HelpCenterContactFormCopyLink)
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Switch>
                <Route exact path={CONTACT_FORM_MANAGE_EMBEDMENTS_PATH}>
                    <BackLink
                        path={insertContactFormIdParam(
                            CONTACT_FORM_PUBLISH_PATH,
                            contactForm.id
                        )}
                        label={'Back to publishing methods'}
                    />
                    <ManageEmbedments
                        embedments={getPageEmbedments.data ?? []}
                    />
                </Route>
                <Route exact path={CONTACT_FORM_PUBLISH_PATH}>
                    <div
                        className={classNames(
                            contactFormCss.container,
                            settingsCss.contentWrapper
                        )}
                    >
                        <section>
                            <div className={contactFormCss.mbM}>
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
                            </div>

                            <FormGroup className={settingsCss.mb0}>
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
                            <ContactFormAutoEmbedPublishSection
                                isDisabled={
                                    isLoading ||
                                    !isWorking ||
                                    (getPageEmbedments.isLoading &&
                                        !getPageEmbedments.isFetched)
                                }
                                contactFormId={contactForm.id}
                                contactFormShopName={contactForm.shop_name}
                                pageEmbedments={
                                    isLoading || !isWorking
                                        ? []
                                        : getPageEmbedments.data ?? []
                                }
                            />

                            <ContactFormManualEmbedCard
                                codeSnippet={contactForm.code_snippet_template}
                                shopName={contactForm.shop_name}
                            />
                        </section>

                        {isHelpCenterAnalyticsEnabled && (
                            <section>
                                <ContactFormMailtoReplacementSection />
                            </section>
                        )}
                    </div>
                </Route>
            </Switch>
        </Container>
    )
}

export default ContactFormPublish
