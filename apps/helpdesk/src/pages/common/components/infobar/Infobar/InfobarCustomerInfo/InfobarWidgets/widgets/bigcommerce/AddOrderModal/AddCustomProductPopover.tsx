import React, { useRef, useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import { BigCommerceCustomProduct } from 'models/integration/types'
import IconButton from 'pages/common/components/button/IconButton'
import InputField from 'pages/common/forms/input/InputField'
import { getMoneySymbol } from 'utils/getMoneySymbol'

import { PopoverContainer } from './components/popover-container/PopoverContainer'

import css from './AddCustomProductPopover.less'

type Props = {
    id: string
    currencyCode: string
    onAddCustomProduct: (customProduct: BigCommerceCustomProduct) => void
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}

const initialState = {
    productTitle: '',
    productSKU: '',
    productPrice: '',
    productQuantity: 1 as string | number,
}

export function AddCustomProductPopover({
    id,
    currencyCode,
    onAddCustomProduct,
    isOpen,
    onOpen: onOpenProp,
    onClose: onCloseProp,
}: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null)

    const [state, setState] = useState(initialState)

    const onClose = () => {
        onCloseProp()
        setState(initialState)
    }

    const onToggle = () => {
        if (isOpen) {
            return onClose()
        }

        return onOpenProp()
    }

    const onProductTitleChange = (productTitle: string) => {
        setState({
            ...state,
            productTitle: productTitle,
        })
    }

    const onProductSKUChange = (productSKU: string) => {
        setState({
            ...state,
            productSKU: productSKU,
        })
    }

    const onProductPriceChange = (productPrice: string) => {
        setState({
            ...state,
            productPrice: productPrice,
        })
    }

    const onProductQuantityChange = (productQuantity: string | number) => {
        setState({
            ...state,
            productQuantity:
                (typeof productQuantity === 'string'
                    ? parseFloat(productQuantity)
                    : productQuantity) || '',
        })
    }

    const handleOnClick = (event: React.FormEvent<HTMLInputElement>) => {
        event.currentTarget.select()
    }

    const checkProductValidity = () => {
        return !!(
            state.productTitle &&
            state.productTitle.length > 0 &&
            !isNaN(parseFloat(state.productPrice)) &&
            parseFloat(state.productPrice) >= 0 &&
            typeof state.productQuantity === 'number' &&
            !isNaN(state.productQuantity) &&
            state.productQuantity &&
            state.productQuantity >= 1
        )
    }

    const handleAddCustomProduct = () => {
        if (checkProductValidity()) {
            onAddCustomProduct({
                name: state.productTitle,
                sku: state.productSKU,
                list_price: parseFloat(state.productPrice),
                quantity: state.productQuantity as number,
            })
            onClose()
        }
    }

    return (
        <>
            <IconButton
                id={id}
                intent="secondary"
                className="ml-2"
                ref={buttonRef}
                onClick={onToggle}
                isDisabled={!currencyCode}
            >
                add
            </IconButton>
            {currencyCode && (
                <PopoverContainer
                    isOpen={isOpen}
                    onToggle={onToggle}
                    target={buttonRef}
                    dropdownPlacement="bottom-end"
                    body={
                        <div className={css.dropdownBody}>
                            <InputField
                                name="title"
                                label="Custom product name"
                                className="mb-2"
                                value={state.productTitle}
                                isRequired
                                onChange={onProductTitleChange}
                                onClick={handleOnClick}
                                onFocus={handleOnClick}
                            />
                            <InputField
                                name="sku"
                                label="SKU"
                                className="mb-2"
                                value={state.productSKU}
                                onChange={onProductSKUChange}
                                onClick={handleOnClick}
                                onFocus={handleOnClick}
                            />
                            <div className={css.flexForm}>
                                <InputField
                                    name="price"
                                    label="Price per item"
                                    isRequired
                                    prefix={getMoneySymbol(currencyCode, true)}
                                    min={0}
                                    value={state.productPrice}
                                    onChange={onProductPriceChange}
                                    onClick={handleOnClick}
                                    onFocus={handleOnClick}
                                />
                                <InputField
                                    name="quantity"
                                    label="Quantity"
                                    className="ml-3"
                                    isRequired
                                    min={1}
                                    value={state.productQuantity}
                                    onChange={onProductQuantityChange}
                                    onClick={handleOnClick}
                                    onFocus={handleOnClick}
                                />
                            </div>
                        </div>
                    }
                    footer={
                        <>
                            <Button intent="secondary" onClick={onClose}>
                                Close
                            </Button>
                            <Button
                                onClick={handleAddCustomProduct}
                                isDisabled={!checkProductValidity()}
                            >
                                Add Item
                            </Button>
                        </>
                    }
                />
            )}
        </>
    )
}
