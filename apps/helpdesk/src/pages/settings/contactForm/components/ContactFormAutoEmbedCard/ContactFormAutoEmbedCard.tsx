import { useState } from 'react'

import classnames from 'classnames'
import _noop from 'lodash/noop'
import { Link, useHistory } from 'react-router-dom'

import { Badge, Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { ContactFormPageEmbedment } from 'models/contactForm/types'
import Button from 'pages/common/components/button/Button'
import { EmbeddablePage } from 'pages/common/components/PageEmbedmentForm/types'
import {
    insertContactFormIdParam,
    linkToContactFormPreferences,
    linkToShopifyIntegration,
} from 'pages/settings/contactForm/utils/navigation'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import { CONTACT_FORM_MANAGE_EMBEDMENTS_PATH } from '../../constants'
import { useGetShopifyPages } from '../../queries'
import ContactFormAutoEmbedModalAssistant from '../ContactFormAutoEmbedModalAssistant'
import {
    CONTACT_FORM_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID,
    CONTACT_FORM_AUTO_EMBED_CARD_ID,
    CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID,
} from './constants'

import css from './ContactFormAutoEmbedCard.less'

const CardContent = (props: {
    hasEmbeddedPages: boolean
    isDisabled: boolean
}) => {
    const { hasEmbeddedPages, isDisabled } = props

    return (
        <div>
            <h3 className={css.title}>
                Automatically embed on your website
                {!hasEmbeddedPages && (
                    <Badge
                        className={css.badge}
                        type={isDisabled ? 'light' : 'light-success'}
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
    isDisabled?: boolean
    isNotConnected: boolean
    shopifyIntegrationId: number | null
    needScopeUpdate: boolean
    hasEmbeddedPages: boolean
    contactFormId: number
    pageEmbedments: ContactFormPageEmbedment[]
}

const ContactFormAutoEmbedCard = ({
    isNotConnected,
    shopifyIntegrationId,
    needScopeUpdate,
    hasEmbeddedPages,
    contactFormId,
    pageEmbedments,
    isDisabled = false,
}: ContactFormAutoEmbedCardProps) => {
    const history = useHistory()
    // Embed modal assistant state
    const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false)
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    const isConnectedToNonShopify = !isNotConnected && !shopifyIntegrationId

    const getShopifyPages = useGetShopifyPages(contactFormId, {
        enabled: isEmbedModalOpen && !needScopeUpdate && !isNotConnected,
    })
    const pages: EmbeddablePage[] = getShopifyPages.data ?? []
    const availablePages = pages.filter((page) =>
        pageEmbedments.every(
            (pageEmbedment) =>
                pageEmbedment.page_external_id !== page.external_id,
        ),
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

                <Button
                    data-testid={
                        CONTACT_FORM_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID
                    }
                    isDisabled={true}
                >
                    Embed Form
                </Button>
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

                <Button
                    data-testid={
                        CONTACT_FORM_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID
                    }
                    isDisabled={true}
                >
                    Embed Form
                </Button>
            </div>
        )
    }

    // Connected to a Shopify store
    if (shopifyIntegrationId) {
        if (hasEmbeddedPages) {
            const navigateToEmbedmentManagement = () => {
                history.push(
                    insertContactFormIdParam(
                        CONTACT_FORM_MANAGE_EMBEDMENTS_PATH,
                        contactFormId,
                    ),
                )
            }
            return (
                <div
                    className={classnames(css.card, {
                        [css.disabled]: isDisabled,
                        [css.clickable]: true,
                    })}
                    data-testid={CONTACT_FORM_AUTO_EMBED_CARD_TEST_ID}
                    id={CONTACT_FORM_AUTO_EMBED_CARD_ID}
                    onClick={navigateToEmbedmentManagement}
                >
                    <i
                        className="material-icons text-success"
                        style={{ fontSize: 24 }}
                    >
                        check_circle
                    </i>

                    <CardContent
                        hasEmbeddedPages={true}
                        isDisabled={isDisabled}
                    />
                    <i className={`material-icons`}>keyboard_arrow_right</i>
                </div>
            )
        }

        const openEmbedFormWizard = needScopeUpdate
            ? _noop
            : () => {
                  setIsEmbedModalOpen(true)
                  logEvent(SegmentEvent.ContactFormAutoEmbedEmbedFormClicked, {
                      user_id: currentUser.get('id'),
                      account_domain: currentAccount.get('domain'),
                      contact_form_id: contactFormId,
                      page_embedments_count: pageEmbedments.length,
                  })
              }

        return (
            <div
                className={classnames(css.card, {
                    [css.disabled]: needScopeUpdate || isDisabled,
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
                    isDisabled={needScopeUpdate || isDisabled}
                    isLoading={
                        getShopifyPages.isFetching &&
                        !getShopifyPages.isFetched &&
                        !getShopifyPages.isError
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
                    contactFormId={contactFormId}
                />
            </div>
        )
    }

    return null
}

export default ContactFormAutoEmbedCard
