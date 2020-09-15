// @flow

import React from 'react'
import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Popover,
    PopoverBody,
} from 'reactstrap'
import {fromJS, type Record} from 'immutable'
import classnames from 'classnames'

import * as segmentTracker from '../../../../../../../../../../../../store/middlewares/segmentTracker'
import type {LineItem} from '../../../../../../../../../../../../constants/integrations/types/shopify'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number.ts'
import {focusElement} from '../../../../../../../../../../../../utils/html'
import AmountInput from '../../AmountInput'
import {ShopifyAction} from '../../../constants'

import css from './AddCustomItemPopover.less'

type Props = {
    id: string,
    placement: string,
    actionName: string,
    className: ?string,
    currencyCode: string,
    onSubmit: (Record<$Shape<LineItem>>) => void,
}

type State = {
    isOpen: boolean,
    title: string,
    price: string,
    quantity: number,
    taxable: boolean,
    requiresShipping: boolean,
}

export default class AddCustomItemPopover extends React.PureComponent<
    Props,
    State
> {
    static defaultProps = {
        placement: 'bottom',
        className: null,
    }

    _buttonElement: HTMLButtonElement
    _inputElement: HTMLInputElement

    state = {
        isOpen: false,
        title: '',
        price: '',
        quantity: 1,
        taxable: false,
        requiresShipping: false,
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {actionName} = this.props
        const {isOpen} = this.state
        const {isOpen: wasOpen} = prevState

        const onOpen = !wasOpen && isOpen
        const onClose = wasOpen && !isOpen

        if (onOpen) {
            focusElement(() => this._inputElement)
            segmentTracker.logEvent(
                actionName === ShopifyAction.CREATE_ORDER
                    ? segmentTracker.EVENTS
                          .SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_OPEN
                    : segmentTracker.EVENTS
                          .SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_OPEN
            )
        } else if (onClose) {
            focusElement(() => this._buttonElement)
        }
    }

    _onKeyDown = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            this._toggle()
        }
    }

    _toggle = () => {
        const {isOpen} = this.state

        this.setState({
            isOpen: !isOpen,
        })
    }

    _saveButtonRef = (buttonRef: HTMLButtonElement) => {
        this._buttonElement = buttonRef
    }

    _saveInputRef = (inputRef: HTMLInputElement) => {
        this._inputElement = inputRef
    }

    _onTitleChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const title = event.target.value
        this.setState({title})
    }

    _onPriceChange = (price: string) => {
        this.setState({price})
    }

    _onQuantityChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const quantity = parseInt(event.target.value) || 1
        this.setState({quantity})
    }

    _onTaxableChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const taxable = event.target.checked
        this.setState({taxable})
    }

    _onShippingChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const requiresShipping = event.target.checked
        this.setState({requiresShipping})
    }

    _onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        const {currencyCode, actionName, onSubmit} = this.props
        const {title, price, quantity, taxable, requiresShipping} = this.state

        event.preventDefault()
        this._toggle()
        this._resetValues()

        onSubmit(
            fromJS({
                title,
                price: formatPrice(price, currencyCode),
                quantity,
                taxable,
                requires_shipping: requiresShipping,
                product_exists: false,
            })
        )

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_SAVE
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_SAVE
        )
    }

    _onCancel = () => {
        const {actionName} = this.props

        this._toggle()
        this._resetValues()

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_CUSTOM_ITEM_POPOVER_CANCEL
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_CUSTOM_ITEM_POPOVER_CANCEL
        )
    }

    _resetValues() {
        this.setState({
            title: '',
            price: '',
            quantity: 1,
        })
    }

    render() {
        const {id, placement, className, currencyCode} = this.props
        const {
            isOpen,
            title,
            price,
            quantity,
            taxable,
            requiresShipping,
        } = this.state

        return (
            <div>
                <Button
                    id={id}
                    className={classnames(className, css.focusable)}
                    tabIndex={0}
                    innerRef={this._saveButtonRef}
                    onClick={this._toggle}
                >
                    <i className="icon material-icons mr-2">add</i>
                    Add custom item
                </Button>
                <Popover
                    placement={placement}
                    isOpen={isOpen}
                    target={id}
                    toggle={this._toggle}
                >
                    <Form onKeyDown={this._onKeyDown} onSubmit={this._onSubmit}>
                        <PopoverBody className="pt-3">
                            <FormGroup>
                                <Label for="title">Line item name</Label>
                                <Input
                                    type="text"
                                    id="title"
                                    autoComplete="off"
                                    required
                                    value={title}
                                    className={css.titleInput}
                                    innerRef={this._saveInputRef}
                                    onChange={this._onTitleChange}
                                />
                            </FormGroup>
                            <div className="d-flex">
                                <FormGroup className="mr-4">
                                    <Label for="price">Price per item</Label>
                                    <AmountInput
                                        id="price"
                                        required
                                        value={price}
                                        className={css.priceInput}
                                        currencyCode={currencyCode}
                                        onChange={this._onPriceChange}
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="quantity">Quantity</Label>
                                    <Input
                                        type="number"
                                        id="quantity"
                                        min={1}
                                        required
                                        value={quantity}
                                        className={css.quantityInput}
                                        onChange={this._onQuantityChange}
                                    />
                                </FormGroup>
                            </div>
                            <FormGroup check className="mt-1 mb-3">
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        checked={taxable}
                                        onChange={this._onTaxableChange}
                                    />
                                    <span className="ml-1">
                                        Item is taxable
                                    </span>
                                </Label>
                            </FormGroup>
                            <FormGroup check className="mb-3">
                                <Label check>
                                    <Input
                                        type="checkbox"
                                        checked={requiresShipping}
                                        onChange={this._onShippingChange}
                                    />
                                    <span className="ml-1">
                                        Item requires shipping
                                    </span>
                                </Label>
                            </FormGroup>
                        </PopoverBody>
                        <hr className="m-0" />
                        <PopoverBody className="d-flex">
                            <Button
                                type="button"
                                tabIndex={0}
                                className={css.focusable}
                                onClick={this._onCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                tabIndex={0}
                                className={classnames('ml-auto', css.focusable)}
                            >
                                Save item
                            </Button>
                        </PopoverBody>
                    </Form>
                </Popover>
            </div>
        )
    }
}
