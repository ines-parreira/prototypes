import React, {
    ChangeEvent,
    useState,
    useCallback,
    useMemo,
    MouseEvent,
    useRef,
} from 'react'
import {Input, ListGroup, ListGroupItem} from 'reactstrap'
import {List, Map} from 'immutable'
import classnames from 'classnames'
import {Link} from 'react-router-dom'

import pluralize from 'pluralize'
import {logEvent, SegmentEvent} from 'common/segment'
import {
    DELETE_DISCOUNT_MODAL_NAME,
    DISCOUNTS_PER_PAGE,
    UNIQUE_DISCOUNT_MODAL_NAME,
} from 'models/discountCodes/constants'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Tooltip from 'pages/common/components/Tooltip'

import {useModalManager} from 'hooks/useModalManager'
import Loader from 'pages/common/components/Loader/Loader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'

import {UniqueDiscountOffer} from 'models/convert/discountOffer/types'
import {useListDiscountOffers} from 'pages/convert/discountOffer/hooks/useListDiscountOffer'
import {DeleteUniqueDiscountOfferModal} from 'pages/convert/discountOffer/components/DeleteUniqueDiscountOfferModal/DeleteUniqueDiscountOfferModal'
import IconButton from 'pages/common/components/button/IconButton'
import {UniqueDiscountOfferCreateModal} from 'pages/common/components/UniqueDiscountOfferCreateModal/UniqueDiscountOfferCreateModal'

import css from './UniqueDiscountOfferResults.less'
import {computeDiscountOfferSummary, testIds} from './utils'

const MAX_LIMIT: number = 15

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
    const discountCodeCountRef = useRef<number>(0)
    const [filter, setFilter] = useState('')
    const currentAccount = useAppSelector(getCurrentAccountState)

    const shopifyScope = useMemo<string[]>(() => {
        const scope = integration.getIn(['oauth', 'scope']) as List<string>
        return scope.toArray()
    }, [integration])

    const hasShopifyDiscountScope = ['read_discounts', 'write_discounts'].every(
        (scope) => shopifyScope.includes(scope)
    )

    const {isLoading, data: discountCodes} = useListDiscountOffers({
        store_integration_id: integration.get('id'),
        search: filter,
    })

    const discountCodeCount = useMemo<number>(() => {
        // During the first load we shouldn't have filters
        if (filter) {
            return discountCodeCountRef.current
        }

        discountCodeCountRef.current = discountCodes?.length ?? 0
        return discountCodeCountRef.current
    }, [discountCodes, filter])

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            event.preventDefault()
            setFilter(event.target.value)
        },
        [setFilter]
    )

    const createDiscountModal = useModalManager(UNIQUE_DISCOUNT_MODAL_NAME, {
        autoDestroy: false,
    })

    const deleteDiscountModal = useModalManager(DELETE_DISCOUNT_MODAL_NAME, {
        autoDestroy: false,
    })

    // Solves issue with closing the popover without intention
    const handleCloseCreateModal = useCallback(() => {
        setTimeout(() => {
            createDiscountModal.closeModal(UNIQUE_DISCOUNT_MODAL_NAME)
        }, 100)
    }, [createDiscountModal])

    const handleCloseDeleteModal = useCallback(() => {
        setTimeout(() => {
            deleteDiscountModal.closeModal(DELETE_DISCOUNT_MODAL_NAME)
        }, 100)
    }, [deleteDiscountModal])

    const handleOpenModal = useCallback(() => {
        createDiscountModal.openModal(UNIQUE_DISCOUNT_MODAL_NAME, false)
    }, [createDiscountModal])

    const handleSubmitModal = useCallback(
        (data: UniqueDiscountOffer) => {
            createDiscountModal.closeModal(UNIQUE_DISCOUNT_MODAL_NAME)

            logEvent(SegmentEvent.InsertUniqueDiscountCodeCreated, {
                account_domain: currentAccount?.get('domain'),
                discount: {
                    id: data.id,
                    prefix: data.prefix,
                },
            })
        },
        [createDiscountModal, currentAccount]
    )

    const onEditDiscountOffer = useCallback(
        (event: MouseEvent<HTMLButtonElement>, offer: UniqueDiscountOffer) => {
            event.preventDefault()
            event.stopPropagation()

            createDiscountModal.openModal(
                UNIQUE_DISCOUNT_MODAL_NAME,
                undefined,
                offer
            )
        },
        [createDiscountModal]
    )

    const onDeleteDiscountOfferIntent = useCallback(
        (event: MouseEvent<HTMLButtonElement>, offer: UniqueDiscountOffer) => {
            event.preventDefault()
            event.stopPropagation()

            deleteDiscountModal.openModal(
                DELETE_DISCOUNT_MODAL_NAME,
                undefined,
                offer
            )
        },
        [deleteDiscountModal]
    )

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
                        <>
                            {discountCodeCount >= MAX_LIMIT && (
                                <Tooltip
                                    aria-label="Tooltip for response not configured"
                                    placement="top-start"
                                    target={'add-button'}
                                    trigger={['hover']}
                                >
                                    You can only have a maximum of 15 offers at
                                    a time.
                                </Tooltip>
                            )}

                            <Button
                                id="add-button"
                                className="mr-2"
                                onClick={handleOpenModal}
                                size="small"
                                tabIndex={-1}
                                isDisabled={discountCodeCount >= MAX_LIMIT}
                            >
                                <ButtonIconLabel icon="add">
                                    Add
                                </ButtonIconLabel>
                            </Button>
                        </>
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
                                            data-testid={
                                                testIds.discountOffer + index
                                            }
                                            className={css.discountContainer}
                                            key={index}
                                            tag="button"
                                            id={'resultRow'.concat(
                                                index.toString()
                                            )}
                                            action
                                            onClick={(event) => {
                                                onDiscountClicked(event, {
                                                    ...result,
                                                    summary:
                                                        computeDiscountOfferSummary(
                                                            result,
                                                            integration
                                                        ),
                                                })
                                            }}
                                        >
                                            <div className={css.legend}>
                                                <div className={css.title}>
                                                    {result.prefix}
                                                </div>
                                                <div className={css.subtitle}>
                                                    {computeDiscountOfferSummary(
                                                        result,
                                                        integration
                                                    )}
                                                </div>
                                            </div>
                                            <div className={css.actions}>
                                                <IconButton
                                                    intent="secondary"
                                                    data-testid={
                                                        testIds.editBtn
                                                    }
                                                    onClick={(e) =>
                                                        onEditDiscountOffer(
                                                            e,
                                                            result
                                                        )
                                                    }
                                                >
                                                    edit
                                                </IconButton>
                                                <IconButton
                                                    intent="destructive"
                                                    data-testid={
                                                        testIds.deleteIntentBtn
                                                    }
                                                    onClick={(e) =>
                                                        onDeleteDiscountOfferIntent(
                                                            e,
                                                            result
                                                        )
                                                    }
                                                >
                                                    delete
                                                </IconButton>
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
                                    Share unique discount codes with your
                                    customers!
                                    <br />
                                    <a href="#" onClick={handleOpenModal}>
                                        Start by creating a code offer
                                    </a>
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <UniqueDiscountOfferCreateModal
                isOpen={createDiscountModal.isOpen()}
                integration={integration}
                onClose={handleCloseCreateModal}
                onSubmit={handleSubmitModal}
            />
            <DeleteUniqueDiscountOfferModal
                isOpen={deleteDiscountModal.isOpen()}
                onClose={handleCloseDeleteModal}
            />
        </div>
    )
}
