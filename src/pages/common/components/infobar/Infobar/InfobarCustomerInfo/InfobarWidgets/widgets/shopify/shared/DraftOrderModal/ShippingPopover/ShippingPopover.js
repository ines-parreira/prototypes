// @flow

import React, {type Node} from 'react'
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
import * as Shopify from '../../../../../../../../../../../../constants/integrations/shopify'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import {focusElement} from '../../../../../../../../../../../../utils/html'
import MoneyAmount from '../../../../MoneyAmount'
import AmountInput from '../../AmountInput'
import {ShopifyAction} from '../../../constants'

import css from './ShippingPopover.less'

type Props = {
    id: string,
    actionName: string,
    children: Node,
    placement: string,
    editable: boolean,
    currencyCode: string,
    value: Record<$Shape<Shopify.ShippingLine>> | null,
    defaultValue: Record<Shopify.ShippingLine> | null,
    onChange: (Record<$Shape<Shopify.ShippingLine>> | null) => void,
}

type State = {
    isOpen: boolean,
    type: ?string,
    title: string,
    price: string,
}

export default class ShippingPopover extends React.PureComponent<Props, State> {
    static _FREE_SHIPPING_TITLE = 'Free shipping'

    static defaultProps = {
        placement: 'bottom',
    }

    _buttonElement: HTMLButtonElement
    _originalInputElement: HTMLInputElement
    _freeInputElement: HTMLInputElement

    state = {
        isOpen: false,
        ...this._initState(),
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {actionName} = this.props
        const {isOpen} = this.state
        const {isOpen: wasOpen} = prevState

        const onOpen = !wasOpen && isOpen
        const onClose = wasOpen && !isOpen

        if (onOpen) {
            focusElement(
                () => this._originalInputElement || this._freeInputElement
            )
            segmentTracker.logEvent(
                actionName === ShopifyAction.CREATE_ORDER
                    ? segmentTracker.EVENTS
                          .SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_OPEN
                    : segmentTracker.EVENTS
                          .SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_OPEN
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

    _initState(): $Shape<State> {
        const {value, defaultValue} = this.props

        if (!value) {
            return {
                type: null,
                title: '',
                price: '',
            }
        }

        if (
            defaultValue &&
            value.get('code') === defaultValue.get('code') &&
            value.get('price') === defaultValue.get('price') &&
            value.get('title') === defaultValue.get('title')
        ) {
            return {
                type: 'original',
                title: '',
                price: '',
            }
        }

        if (this._isFreeShipping(value)) {
            return {
                type: 'free',
                title: '',
                price: '',
            }
        }

        return {
            type: 'custom',
            title: value.get('title'),
            price: value.get('price'),
        }
    }

    _isFreeShipping(value: Record<$Shape<Shopify.ShippingLine>>): boolean {
        const {currencyCode} = this.props

        return (
            value.get('code') === 'custom' &&
            value.get('price') === formatPrice(0, currencyCode) &&
            value.get('title') === ShippingPopover._FREE_SHIPPING_TITLE
        )
    }

    _saveButtonRef = (buttonRef: HTMLButtonElement) => {
        this._buttonElement = buttonRef
    }

    _saveOriginalInputRef = (inputRef: HTMLInputElement) => {
        this._originalInputElement = inputRef
    }

    _saveFreeInputRef = (inputRef: HTMLInputElement) => {
        this._freeInputElement = inputRef
    }

    _onTypeChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const type = event.target.value
        this.setState({type})
    }

    _onTitleChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const title = event.target.value
        this.setState({title})
    }

    _onPriceChange = (price: string) => {
        this.setState({price})
    }

    _onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        const {currencyCode, onChange, defaultValue, actionName} = this.props
        const {type, title, price} = this.state

        event.preventDefault()
        this._toggle()

        switch (type) {
            case 'original':
                onChange(defaultValue)
                break
            case 'free':
                onChange(
                    fromJS({
                        code: 'custom',
                        price: formatPrice(0, currencyCode),
                        title: ShippingPopover._FREE_SHIPPING_TITLE,
                    })
                )
                break
            case 'custom':
                onChange(
                    fromJS({
                        code: 'custom',
                        price: formatPrice(price, currencyCode),
                        title: title || 'Custom',
                    })
                )
                break
            default:
                break
        }

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_APPLY
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_APPLY,
            {type}
        )
    }

    _onRemove = () => {
        const {actionName, onChange} = this.props

        this._toggle()
        onChange(fromJS(null))

        this.setState({
            type: null,
            title: '',
            price: '',
        })

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_REMOVE
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_REMOVE
        )
    }

    _onClose = () => {
        const {actionName} = this.props

        this._toggle()

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_CLOSE
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_CLOSE
        )
    }

    render() {
        const {
            id,
            children,
            placement,
            editable,
            value,
            currencyCode,
            defaultValue,
        } = this.props
        const {isOpen, type, title, price} = this.state
        const shouldDisplayOriginalOption =
            !!defaultValue && !this._isFreeShipping(defaultValue)

        return (
            <div>
                <Button
                    id={id}
                    type="button"
                    color="link"
                    className={classnames('p-0', css.focusable)}
                    disabled={!editable}
                    tabIndex={0}
                    innerRef={this._saveButtonRef}
                    onClick={this._toggle}
                >
                    <strong>{children}</strong>
                </Button>
                {value && (
                    <span className={css.title}>{value.get('title')}</span>
                )}
                <Popover
                    placement={placement}
                    isOpen={isOpen}
                    target={id}
                    toggle={this._toggle}
                >
                    <Form onKeyDown={this._onKeyDown} onSubmit={this._onSubmit}>
                        <PopoverBody className="pt-3">
                            {shouldDisplayOriginalOption && (
                                <FormGroup check className="mb-3">
                                    <Label check>
                                        <Input
                                            type="radio"
                                            name="type"
                                            value="original"
                                            required
                                            checked={type === 'original'}
                                            tabIndex={0}
                                            innerRef={
                                                this._saveOriginalInputRef
                                            }
                                            onChange={this._onTypeChange}
                                        />
                                        <span className="d-inline-block ml-1">
                                            {defaultValue && (
                                                <span className="d-block">
                                                    {defaultValue.get('title')}
                                                    <br />
                                                    <MoneyAmount
                                                        currencyCode={
                                                            currencyCode
                                                        }
                                                        amount={defaultValue.get(
                                                            'price'
                                                        )}
                                                    />
                                                </span>
                                            )}
                                        </span>
                                    </Label>
                                </FormGroup>
                            )}
                            <FormGroup check className="mb-3">
                                <Label check>
                                    <Input
                                        type="radio"
                                        name="type"
                                        value="free"
                                        required
                                        checked={type === 'free'}
                                        tabIndex={0}
                                        innerRef={this._saveFreeInputRef}
                                        onChange={this._onTypeChange}
                                    />
                                    <span className="ml-1">Free shipping</span>
                                </Label>
                            </FormGroup>
                            <FormGroup check>
                                <Label check>
                                    <Input
                                        type="radio"
                                        name="type"
                                        value="custom"
                                        required
                                        checked={type === 'custom'}
                                        tabIndex={0}
                                        onChange={this._onTypeChange}
                                    />
                                    <span className="ml-1">Custom</span>
                                </Label>
                            </FormGroup>
                            <div className="d-flex mt-1">
                                <Input
                                    type="text"
                                    placeholder="Custom rate name"
                                    autoComplete="off"
                                    value={title}
                                    className={css.titleInput}
                                    onChange={this._onTitleChange}
                                />
                                <AmountInput
                                    value={price}
                                    currencyCode={currencyCode}
                                    required={type === 'custom'}
                                    onChange={this._onPriceChange}
                                />
                            </div>
                        </PopoverBody>
                        <hr className="mb-0" />
                        <PopoverBody className="d-flex">
                            {!!value ? (
                                <Button
                                    type="button"
                                    color="danger"
                                    tabIndex={0}
                                    className={css.focusable}
                                    onClick={this._onRemove}
                                >
                                    Remove
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    tabIndex={0}
                                    className={css.focusable}
                                    onClick={this._onClose}
                                >
                                    Close
                                </Button>
                            )}
                            <Button
                                color="primary"
                                type="submit"
                                tabIndex={0}
                                className={classnames('ml-auto', css.focusable)}
                            >
                                Apply
                            </Button>
                        </PopoverBody>
                    </Form>
                </Popover>
            </div>
        )
    }
}
