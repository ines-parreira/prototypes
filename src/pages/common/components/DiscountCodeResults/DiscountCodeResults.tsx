import React, {ChangeEvent, useState, useCallback} from 'react'
import {useAsyncFn, useDebounce} from 'react-use'
import {Input, ListGroup, ListGroupItem, Modal} from 'reactstrap'
import {Map} from 'immutable'
import classnames from 'classnames'

import {
    DISCOUNT_MODAL_NAME,
    DISCOUNTS_PER_PAGE,
} from 'models/discountCodes/constants'
import {DiscountCode} from 'models/discountCodes/types'
import DiscountCodeCreateModal from 'pages/common/components/DiscountCodeCreateModal/DiscountCodeCreateModal'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {useModalManager} from 'hooks/useModalManager'
import Loader from 'pages/common/components/Loader/Loader'
import client from 'models/api/resources'
import css from './DiscountCodeResults.less'

type OwnProps = {
    integration: Map<string, string>
    onDiscountClicked: (
        event: React.MouseEvent<HTMLElement>,
        discount: DiscountCode
    ) => void
    onResetStoreChoice?: () => void
}

export default function DiscountCodeResults({
    integration,
    onResetStoreChoice,
    onDiscountClicked,
}: OwnProps) {
    const dispatch = useAppDispatch()
    const [filter, setFilter] = useState('')
    const [discountCodes, setDiscountResults] = useState<DiscountCode[]>([])

    const [{loading: isLoading}, handleFetchResults] = useAsyncFn(async () => {
        try {
            const response: {data: {data: DiscountCode[]}} = await client.get(
                `/api/discount-codes/${integration.get('id')}/`,
                {
                    params: {search: filter},
                }
            )
            setDiscountResults(response.data.data)
        } catch (error) {
            void dispatch(
                notify({
                    message: "Couldn't fetch discount codes",
                    status: NotificationStatus.Error,
                })
            )
        }
    }, [filter])

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
        (data) => {
            discountModal.closeModal(DISCOUNT_MODAL_NAME)
            setDiscountResults([data, ...discountCodes])
        },
        [discountCodes, discountModal]
    )

    useDebounce(handleFetchResults, 300, [filter])

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
                    placeholder={'Search discount codes'}
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
                    <Button
                        className="mr-2"
                        onClick={handleOpenModal}
                        size="small"
                        tabIndex={-1}
                    >
                        <ButtonIconLabel icon="add">Add</ButtonIconLabel>
                    </Button>
                </div>
                <div>
                    <span className={css.headerText}>
                        {integration.get('name')}
                    </span>
                </div>
                <div className={css.itemCount}>
                    <span className={css.resultTotal}>
                        {discountCodes.length}
                        {discountCodes.length >= DISCOUNTS_PER_PAGE ? '+' : ''}
                        {' Discounts'}
                    </span>
                </div>
            </div>
            <div className={css.listGroupContainer}>
                {discountCodes.length > 0 && (
                    <ListGroup flush>
                        {discountCodes.map((result, index) => (
                            <ListGroupItem
                                key={index}
                                tag="button"
                                id={'resultRow'.concat(index.toString())}
                                action
                                onClick={(event) => {
                                    onDiscountClicked(event, result)
                                }}
                            >
                                <div className={css.container}>
                                    <div className={css.legend}>
                                        <div className={css.title}>
                                            {result.title}
                                        </div>
                                        <div className={css.subtitle}>
                                            {result.summary}
                                        </div>
                                    </div>
                                </div>
                            </ListGroupItem>
                        ))}
                    </ListGroup>
                )}
                {!discountCodes.length && isLoading && (
                    <Loader message="Loading..." minHeight={'200px'} />
                )}
                {!discountCodes.length && !isLoading && (
                    <div className={css.noResultContainer}>
                        <p className={css.noResultText}>No results found</p>
                    </div>
                )}
            </div>
            <Modal
                isOpen={discountModal.isOpen()}
                onClose={handleCloseModal}
                autoFocus={true}
                backdrop="static"
                size="lg"
                // it has to be above popover which is currently set to 1560
                zIndex={1561}
            >
                <DiscountCodeCreateModal
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitModal}
                    integration={integration}
                />
            </Modal>
        </div>
    )
}
