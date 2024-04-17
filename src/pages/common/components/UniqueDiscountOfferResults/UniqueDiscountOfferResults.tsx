import React, {ChangeEvent, useState, useCallback, useMemo} from 'react'
import {Input, ListGroup, ListGroupItem} from 'reactstrap'
import {List, Map} from 'immutable'
import classnames from 'classnames'
import {Link} from 'react-router-dom'

import pluralize from 'pluralize'
import {logEvent, SegmentEvent} from 'common/segment'
import {
    DISCOUNTS_PER_PAGE,
    DISCOUNT_MODAL_NAME,
} from 'models/discountCodes/constants'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {useModalManager} from 'hooks/useModalManager'
import Loader from 'pages/common/components/Loader/Loader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getTicketState} from 'state/ticket/selectors'
import {getAllCustomerIdsFromTicket} from 'state/ticket/helpers'
import {SHOPIFY_INTEGRATION_TYPE} from 'constants/integration'

import {UniqueDiscountOffer} from 'models/convert/discountOffer/types'
import {useListDiscountOffers} from 'models/convert/discountOffer/queries'
import {UniqueDiscountOfferCreateModal} from '../UniqueDiscountOfferCreateModal/UniqueDiscountOfferCreateModal'
import css from './UniqueDiscountOfferResults.less'

type OwnProps = {
    integration: Map<string, string>
    onDiscountClicked: (
        event: React.MouseEvent<HTMLElement>,
        discount: UniqueDiscountOffer
    ) => void
    onResetStoreChoice?: () => void
}

export default function UniqueDiscountCodeResults({
    integration,
    onResetStoreChoice,
    onDiscountClicked,
}: OwnProps) {
    const dispatch = useAppDispatch()
    const [filter, setFilter] = useState('')
    const currentAccount = useAppSelector(getCurrentAccountState)
    const ticket = useAppSelector(getTicketState)

    const shopifyScope = useMemo<string[]>(() => {
        const scope = integration.getIn(['oauth', 'scope']) as List<string>
        return scope.toArray()
    }, [integration])

    const hasShopifyDiscountScope = ['read_discounts', 'write_discounts'].every(
        (scope) => shopifyScope.includes(scope)
    )

    const {
        isLoading,
        data: discountCodes,
        refetch: refetchDiscountOffers,
        isError: isErrorDiscountOffers,
    } = useListDiscountOffers({
        store_integration_id: integration.get('id'),
        search: filter,
    })

    if (isErrorDiscountOffers) {
        void dispatch(
            notify({
                message: "Couldn't fetch discount codes",
                status: NotificationStatus.Error,
            })
        )
    }

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            event.preventDefault()
            setFilter(event.target.value)
        },
        [setFilter]
    )

    const discountModal = useModalManager(DISCOUNT_MODAL_NAME, {
        autoDestroy: false,
    })

    const handleCloseModal = useCallback(() => {
        discountModal.closeModal(DISCOUNT_MODAL_NAME)
    }, [discountModal])

    const handleOpenModal = useCallback(() => {
        discountModal.openModal(DISCOUNT_MODAL_NAME, false)
    }, [discountModal])

    const handleSubmitModal = useCallback(
        async (data: UniqueDiscountOffer) => {
            discountModal.closeModal(DISCOUNT_MODAL_NAME)
            await refetchDiscountOffers()

            const customerData = getAllCustomerIdsFromTicket(
                ticket,
                (integration) =>
                    integration.get('__integration_type__') ===
                    SHOPIFY_INTEGRATION_TYPE
            )
            logEvent(SegmentEvent.InsertUniqueDiscountCodeCreated, {
                account_domain: currentAccount?.get('domain'),
                discount: {
                    id: data.id,
                    prefix: data.prefix,
                },
                customer: customerData,
            })
        },
        [discountModal, refetchDiscountOffers, ticket, currentAccount]
    )

    // TODO: Revisit the summary text
    const getResultSummary = (offer: UniqueDiscountOffer): React.ReactNode => {
        switch (offer.type) {
            case 'fixed':
                return offer.value
                    ? `Get ${integration.get('currency')}${offer.value} off`
                    : ''
            case 'percentage':
                return offer.value ? `Get ${offer.value}% off` : ''
            case 'free_shipping':
                return 'Get free shipping for this'
        }
    }

    return (
        <div className={css.discountLineContainer}>
            <div
                className={classnames(
                    'input-icon input-icon-left',
                    css.searchInput
                )}
            >
                <i className="icon material-icons md-2">
                    {isLoading ? 'more_horiz' : 'search'}
                </i>
                <Input
                    type="text"
                    value={filter}
                    onChange={handleChange}
                    placeholder={'Search discount offers'}
                    autoFocus
                />
            </div>
            <div className={css.headerResult}>
                <div className={css.backContainer}>
                    {onResetStoreChoice && (
                        <Button
                            className="mr-2"
                            onClick={onResetStoreChoice}
                            size="small"
                            tabIndex={-1}
                        >
                            <ButtonIconLabel icon="arrow_back">
                                Back
                            </ButtonIconLabel>
                        </Button>
                    )}
                    {hasShopifyDiscountScope && (
                        <Button
                            className="mr-2"
                            onClick={handleOpenModal}
                            size="small"
                            tabIndex={-1}
                        >
                            <ButtonIconLabel icon="add">Add</ButtonIconLabel>
                        </Button>
                    )}
                </div>
                <div>
                    <span className={css.headerText}>
                        {integration.get('name')}
                    </span>
                </div>
                <div className={css.itemCount}>
                    <span className={css.resultTotal}>
                        {discountCodes?.length}
                        {discountCodes?.length &&
                        discountCodes?.length >= DISCOUNTS_PER_PAGE
                            ? '+'
                            : ''}
                        {` ${pluralize('OFFER', discountCodes?.length)}`}
                    </span>
                </div>
            </div>
            <div className={css.listGroupContainer}>
                {!hasShopifyDiscountScope ? (
                    <div style={{padding: '8px'}}>
                        <Alert type={AlertType.Error}>
                            Missing Shopify permissions. To use this new
                            feature, please go to the{' '}
                            <Link
                                to={`/app/settings/integrations/shopify/${integration.get(
                                    'id'
                                )}`}
                            >
                                settings page of your Shopify integration&nbsp;
                            </Link>
                            and click on "Update App Permissions".
                        </Alert>
                    </div>
                ) : (
                    <>
                        {discountCodes && discountCodes?.length > 0 && (
                            <ListGroup flush>
                                {discountCodes.map(
                                    (result: UniqueDiscountOffer, index) => (
                                        <ListGroupItem
                                            key={index}
                                            tag="button"
                                            id={'resultRow'.concat(
                                                index.toString()
                                            )}
                                            action
                                            onClick={(event) => {
                                                onDiscountClicked(event, result)
                                            }}
                                        >
                                            <div className={css.container}>
                                                <div className={css.legend}>
                                                    <div className={css.title}>
                                                        {result.prefix}
                                                    </div>
                                                    <div
                                                        className={css.subtitle}
                                                    >
                                                        {getResultSummary(
                                                            result
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </ListGroupItem>
                                    )
                                )}
                            </ListGroup>
                        )}
                        {!discountCodes?.length && isLoading && (
                            <Loader message="Loading..." minHeight={'200px'} />
                        )}
                        {!discountCodes?.length && !isLoading && (
                            <div className={css.noResultContainer}>
                                <p className={css.noResultText}>
                                    No results found
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <UniqueDiscountOfferCreateModal
                isOpen={discountModal.isOpen()}
                integration={integration}
                onClose={handleCloseModal}
                onSubmit={handleSubmitModal}
            />
        </div>
    )
}
