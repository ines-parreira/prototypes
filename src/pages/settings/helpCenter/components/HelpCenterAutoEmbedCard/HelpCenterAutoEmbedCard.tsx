import {Tooltip} from '@gorgias/merchant-ui-kit'
import classnames from 'classnames'
import _noop from 'lodash/noop'
import React from 'react'
import {Link, useHistory} from 'react-router-dom'

import {SegmentEvent, logEvent} from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import {HelpCenterPageEmbedment} from 'models/helpCenter/types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Button from 'pages/common/components/button/Button'
import {EmbeddablePage} from 'pages/common/components/PageEmbedmentForm/types'
import {linkToShopifyIntegration} from 'pages/settings/contactForm/utils/navigation'

import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'

import {HELP_CENTER_BASE_PATH} from '../../constants'
import {useGetShopifyPages} from '../../queries'
import HelpCenterAutoEmbedModalAssistant from '../HelpCenterAutoEmbedModalAssistant'
import {
    HELP_CENTER_AUTO_EMBED_CARD_TEST_ID,
    HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID,
    HELP_CENTER_AUTO_EMBED_CARD_ID,
} from './constants'

import css from './HelpCenterAutoEmbedCard.less'

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
                Gorgias will automatically embed the Help Center on a new or
                existing page on your website. This method is code-free.
            </div>
        </div>
    )
}

export type HelpCenterAutoEmbedCardProps = {
    isDisabled?: boolean
    isNotConnected: boolean
    shopifyIntegrationId: number | null
    needScopeUpdate: boolean
    hasEmbeddedPages: boolean
    helpCenterId: number
    pageEmbedments: HelpCenterPageEmbedment[]
}

const HelpCenterAutoEmbedCard = ({
    isNotConnected,
    shopifyIntegrationId,
    needScopeUpdate,
    hasEmbeddedPages,
    helpCenterId,
    pageEmbedments,
    isDisabled = false,
}: HelpCenterAutoEmbedCardProps) => {
    const history = useHistory()
    // Embed modal assistant state
    const [isEmbedModalOpen, setIsEmbedModalOpen] = React.useState(false)
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    const isConnectedToNonShopify = !isNotConnected && !shopifyIntegrationId

    const getShopifyPages = useGetShopifyPages(helpCenterId, {
        enabled: isEmbedModalOpen && !needScopeUpdate && !isNotConnected,
    })
    const pages: EmbeddablePage[] = getShopifyPages.data ?? []
    const availablePages = pages.filter((page) =>
        pageEmbedments.every(
            (pageEmbedment) =>
                pageEmbedment.page_external_id !== page.external_id
        )
    )

    if (isNotConnected) {
        return (
            <div
                className={classnames(css.card, {
                    [css.disabled]: true,
                    [css.clickable]: false,
                })}
                data-testid={HELP_CENTER_AUTO_EMBED_CARD_TEST_ID}
                id={HELP_CENTER_AUTO_EMBED_CARD_ID}
            >
                <Tooltip
                    placement="top"
                    target={HELP_CENTER_AUTO_EMBED_CARD_ID}
                    autohide={false}
                >
                    Connect a Shopify store to enable auto-embedding
                </Tooltip>

                <CardContent hasEmbeddedPages={false} isDisabled={true} />

                <Button
                    data-testid={
                        HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID
                    }
                    isDisabled={true}
                >
                    Embed Help Center
                </Button>
            </div>
        )
    }

    /**
     * Help Center does not support non Shopify stores yet, but we're implementing this
     * in advance to avoid having to add a new card in the future.
     */
    if (isConnectedToNonShopify) {
        return (
            <div
                className={classnames(css.card, {
                    [css.disabled]: true,
                    [css.clickable]: false,
                })}
                data-testid={HELP_CENTER_AUTO_EMBED_CARD_TEST_ID}
                id={HELP_CENTER_AUTO_EMBED_CARD_ID}
            >
                <Tooltip
                    placement="top"
                    target={HELP_CENTER_AUTO_EMBED_CARD_ID}
                    autohide={false}
                >
                    Only available for Shopify stores
                </Tooltip>

                <CardContent hasEmbeddedPages={false} isDisabled={true} />

                <Button
                    data-testid={
                        HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID
                    }
                    isDisabled={true}
                >
                    Embed Help Center
                </Button>
            </div>
        )
    }

    // Connected to a Shopify store
    if (shopifyIntegrationId) {
        if (hasEmbeddedPages) {
            const navigateToEmbedmentManagement = () => {
                history.push(
                    `${HELP_CENTER_BASE_PATH}/${helpCenterId}/publish-track/embedments`
                )
            }
            return (
                <div
                    className={classnames(css.card, {
                        [css.disabled]: isDisabled,
                        [css.clickable]: true,
                    })}
                    data-testid={HELP_CENTER_AUTO_EMBED_CARD_TEST_ID}
                    id={HELP_CENTER_AUTO_EMBED_CARD_ID}
                    onClick={navigateToEmbedmentManagement}
                >
                    <i
                        className="material-icons text-success"
                        style={{fontSize: 24}}
                    >
                        check_circle
                    </i>

                    <CardContent
                        hasEmbeddedPages={true}
                        isDisabled={isDisabled}
                    />
                    <i className={classnames(`material-icons`, css.caret)}>
                        keyboard_arrow_right
                    </i>
                </div>
            )
        }

        const openEmbedFormWizard = needScopeUpdate
            ? _noop
            : () => {
                  setIsEmbedModalOpen(true)
                  logEvent(SegmentEvent.HelpCenterAutoEmbedEmbedFormClicked, {
                      user_id: currentUser.get('id'),
                      account_domain: currentAccount.get('domain'),
                      help_center_id: helpCenterId,
                      page_embedments_count: pageEmbedments.length,
                  })
              }

        return (
            <div
                className={classnames(css.card, {
                    [css.disabled]: needScopeUpdate || isDisabled,
                    [css.clickable]: false,
                })}
                data-testid={HELP_CENTER_AUTO_EMBED_CARD_TEST_ID}
                id={HELP_CENTER_AUTO_EMBED_CARD_ID}
            >
                {needScopeUpdate ? (
                    <Tooltip
                        placement="top"
                        target={HELP_CENTER_AUTO_EMBED_CARD_ID}
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
                        getShopifyPages.isFetching && !getShopifyPages.isFetched
                    }
                    onClick={openEmbedFormWizard}
                    data-testid={
                        HELP_CENTER_AUTO_EMBED_CARD_EMBED_BUTTON_TEST_ID
                    }
                >
                    Embed Help Center
                </Button>
                <HelpCenterAutoEmbedModalAssistant
                    isOpen={isEmbedModalOpen && getShopifyPages.isFetched}
                    onClose={() => setIsEmbedModalOpen(false)}
                    pages={availablePages}
                    helpCenterId={helpCenterId}
                />
            </div>
        )
    }

    return null
}

export default HelpCenterAutoEmbedCard
