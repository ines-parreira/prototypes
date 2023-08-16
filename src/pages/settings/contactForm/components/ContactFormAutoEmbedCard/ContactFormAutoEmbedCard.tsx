import React from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import _noop from 'lodash/noop'
import Button from 'pages/common/components/button/Button'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import {
    linkToContactFormPreferences,
    linkToShopifyIntegration,
} from 'pages/settings/contactForm/utils/navigation'

import {PageEmbedment} from 'models/contactForm/types'
import ContactFormAutoEmbedModalAssistant from '../ContactFormAutoEmbedModalAssistant'
import {useGetShopifyPages} from '../../queries'
import {EmbeddablePage} from '../PageEmbedmentForm'
import {
    CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID,
    CONTACT_FORM_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID,
    CONTACT_FORM_AUTO_EMBED_CARD_ID,
} from './constants'

import css from './ContactFormAutoEmbedCard.less'

const CardContent = (props: {
    hasEmbeddedPages: boolean
    isDisabled: boolean
}) => {
    const {hasEmbeddedPages, isDisabled} = props

    return (
        <div>
            <h3 className={css.title}>
                Automatically embed on your website
                {!hasEmbeddedPages && (
                    <Badge
                        className={css.badge}
                        type={
                            isDisabled
                                ? ColorType.Light
                                : ColorType.LightSuccess
                        }
                    >
                        RECOMMENDED
                    </Badge>
                )}
            </h3>
            <div>
                Gorgias will automatically embed the contact form on a new or
                existing page on your website. This method is code-free.
            </div>
        </div>
    )
}

export type ContactFormAutoEmbedCardProps = {
    isNotConnected: boolean
    shopifyIntegrationId: number | null
    needScopeUpdate: boolean
    hasEmbeddedPages: boolean
    contactFormId: number
    pageEmbedments: PageEmbedment[]
}

const ContactFormAutoEmbedCard = ({
    isNotConnected,
    shopifyIntegrationId,
    needScopeUpdate,
    hasEmbeddedPages,
    contactFormId,
    pageEmbedments,
}: ContactFormAutoEmbedCardProps) => {
    // Embed modal assistant state
    const [isEmbedModalOpen, setIsEmbedModalOpen] = React.useState(false)

    const isConnectedToNonShopify = !isNotConnected && !shopifyIntegrationId

    const getShopifyPages = useGetShopifyPages(contactFormId, {
        enabled: isEmbedModalOpen,
    })
    const pages: EmbeddablePage[] = getShopifyPages.data ?? []
    const availablePages = pages.filter((page) =>
        pageEmbedments.every(
            (pageEmbedment) => pageEmbedment.shopify_page_id !== page.id
        )
    )

    if (isNotConnected) {
        return (
            <div
                className={classnames(css.card, {
                    [css.disabled]: true,
                    [css.clickable]: false,
                })}
                data-testid={CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID}
                id={CONTACT_FORM_AUTO_EMBED_CARD_ID}
            >
                <Tooltip
                    placement="top"
                    target={CONTACT_FORM_AUTO_EMBED_CARD_ID}
                    autohide={false}
                >
                    <Link to={linkToContactFormPreferences(contactFormId)}>
                        Connect a Shopify store{` `}
                    </Link>
                    to enable auto-embedding
                </Tooltip>

                <CardContent hasEmbeddedPages={false} isDisabled={true} />

                <Button isDisabled={true}>Embed Form</Button>
            </div>
        )
    }

    /**
     * Contact Form does not support non Shopify stores yet, but we're implementing this
     * in advance to avoid having to add a new card in the future.
     */
    if (isConnectedToNonShopify) {
        return (
            <div
                className={classnames(css.card, {
                    [css.disabled]: true,
                    [css.clickable]: false,
                })}
                data-testid={CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID}
                id={CONTACT_FORM_AUTO_EMBED_CARD_ID}
            >
                <Tooltip
                    placement="top"
                    target={CONTACT_FORM_AUTO_EMBED_CARD_ID}
                    autohide={false}
                >
                    Only available for Shopify stores
                </Tooltip>

                <CardContent hasEmbeddedPages={false} isDisabled={true} />

                <Button isDisabled={true}>Embed Form</Button>
            </div>
        )
    }

    // Connected to a Shopify store
    if (shopifyIntegrationId) {
        if (hasEmbeddedPages) {
            const navigateToEmbedmentManagement = () => {
                alert('Must navigate to the Embedment management view')
            }
            return (
                <div
                    className={classnames(css.card, {
                        [css.disabled]: false,
                        [css.clickable]: true,
                    })}
                    data-testid={CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID}
                    id={CONTACT_FORM_AUTO_EMBED_CARD_ID}
                    onClick={navigateToEmbedmentManagement}
                >
                    <i
                        className="material-icons text-success"
                        style={{fontSize: 24}}
                    >
                        check_circle
                    </i>

                    <CardContent hasEmbeddedPages={true} isDisabled={false} />
                    <i className={`material-icons`}>keyboard_arrow_right</i>
                </div>
            )
        }

        const openEmbedFormWizard = needScopeUpdate
            ? _noop
            : () => {
                  setIsEmbedModalOpen(true)
              }

        return (
            <div
                className={classnames(css.card, {
                    [css.disabled]: needScopeUpdate,
                    [css.clickable]: false,
                })}
                data-testid={CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID}
                id={CONTACT_FORM_AUTO_EMBED_CARD_ID}
            >
                {needScopeUpdate ? (
                    <Tooltip
                        placement="top"
                        target={CONTACT_FORM_AUTO_EMBED_CARD_ID}
                        autohide={false}
                    >
                        Update your{` `}
                        <Link
                            to={linkToShopifyIntegration(shopifyIntegrationId)}
                        >
                            Shopify app permissions
                        </Link>
                        {` `}to enable auto-embedding
                    </Tooltip>
                ) : null}

                <CardContent
                    hasEmbeddedPages={false}
                    isDisabled={needScopeUpdate}
                />
                <Button
                    isDisabled={needScopeUpdate}
                    isLoading={
                        getShopifyPages.isFetching && !getShopifyPages.isFetched
                    }
                    onClick={openEmbedFormWizard}
                    data-testid={
                        CONTACT_FORM_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID
                    }
                >
                    Embed Form
                </Button>
                <ContactFormAutoEmbedModalAssistant
                    isOpen={isEmbedModalOpen && getShopifyPages.isFetched}
                    onClose={() => setIsEmbedModalOpen(false)}
                    pages={availablePages}
                />
            </div>
        )
    }

    return null
}

export default ContactFormAutoEmbedCard
