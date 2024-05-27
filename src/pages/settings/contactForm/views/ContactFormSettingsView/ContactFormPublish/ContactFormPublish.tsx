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
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import {ContactFormAutoEmbedReadinessStatus} from 'pages/settings/contactForm/components/ContactFormAutoEmbedPublishSection/types'
import ContactFormIntegrationWarningBanner, {
    ContactFormIntegrationWarningBannerProps,
} from 'pages/settings/contactForm/components/ContactFormIntegrationWarningBanner'
import ContactFormMailtoReplacementSection from '../../../components/ContactFormMailtoReplacementSection/ContactFormMailtoReplacementSection'
import ContactFormAutoEmbedPublishSection from '../../../components/ContactFormAutoEmbedPublishSection'

const getBannerDetails = ({
    integrationId,
    entityId,
    shopName,
    needScopeUpdate,
}: {
    integrationId: null | number
    entityId: number
    shopName: string | null
    needScopeUpdate: boolean
}): ContactFormIntegrationWarningBannerProps['details'] | undefined => {
    if (!shopName) {
        return {
            type: ContactFormAutoEmbedReadinessStatus.NOT_CONNECTED,
            entityId,
        }
    }
    if (integrationId && needScopeUpdate) {
        return {
            type: ContactFormAutoEmbedReadinessStatus.NEED_PERMISSION_UPDATE,
            entityId: integrationId,
        }
    }
}

const ContactFormPublish = (): JSX.Element => {
    const contactForm = useCurrentContactForm()
    const getPageEmbedments = useGetPageEmbedments(contactForm.id, {
        enabled: Boolean(contactForm.shop_name),
    })
    const {copyButtonText} = useClipboard('#copy-shareable-link')

    const {isWorking, isLoading} = useIsShopifyCredentialsWorking()

    const {integrationId, integration, needScopeUpdate} =
        useShopifyIntegrationAndScope(contactForm.shop_name ?? '')

    const onCopyClick = () => {
        logEvent(SegmentEvent.HelpCenterContactFormCopyLink)
    }
    // CF connected to a Shopify store and not needing a scope update
    const canUseIntegration = Boolean(integrationId && !needScopeUpdate)

    // Compute the banner details
    const bannerDetails = getBannerDetails({
        integrationId,
        entityId: contactForm.id,
        shopName: contactForm.shop_name,
        needScopeUpdate,
    })

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
                        {!canUseIntegration && bannerDetails && (
                            <section>
                                <ContactFormIntegrationWarningBanner
                                    details={bannerDetails}
                                />
                            </section>
                        )}
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
                        {contactForm.shop_name &&
                            integration &&
                            canUseIntegration && (
                                <section>
                                    <ContactFormMailtoReplacementSection
                                        shopifyIntegration={integration}
                                        contactFormId={contactForm.id}
                                    />
                                </section>
                            )}
                    </div>
                </Route>
            </Switch>
        </Container>
    )
}

export default ContactFormPublish
