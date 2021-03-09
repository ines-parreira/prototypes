import React, {
    Component,
    ComponentProps,
    ReactNode,
    ChangeEvent,
    FormEvent,
    KeyboardEvent,
} from 'react'
import {
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Popover,
    PopoverBody,
} from 'reactstrap'
import {fromJS, Map, List} from 'immutable'
import classnames from 'classnames'

import * as segmentTracker from '../../../../../../../../../../../../store/middlewares/segmentTracker.js'
import {formatPrice} from '../../../../../../../../../../../../business/shopify/number'
import {focusElement} from '../../../../../../../../../../../../utils/html'
import MoneyAmount from '../../../../MoneyAmount'
import AmountInput from '../../AmountInput/AmountInput'
import {ShopifyActionType} from '../../../types'

import css from './ShippingPopover.less'

type Props = {
    id: string
    actionName: ShopifyActionType
    children: ReactNode
    placement: ComponentProps<typeof Popover>['placement']
    editable: boolean
    currencyCode: string
    value: Map<any, any> | null
    availableShippingRates: List<any>
    onChange: (arg0: Map<any, any> | null) => void
}

type State = {
    isOpen: boolean
    handle: string | null
    title: string
    price: string
}

export default class ShippingPopover extends Component<Props, State> {
    static _FREE_SHIPPING_TITLE = 'Free shipping'

    static defaultProps = {
        placement: 'bottom',
    }

    _buttonElement?: HTMLButtonElement
    _firstInputElement?: HTMLInputElement

    _isFreeShipping = (value: Map<any, any>): boolean => {
        const {currencyCode} = this.props

        return (
            value.get('custom') === true &&
            value.get('handle') === null &&
            value.get('price') === formatPrice(0, currencyCode) &&
            value.get('title') === ShippingPopover._FREE_SHIPPING_TITLE
        )
    }

    _initState = (): Omit<State, 'isOpen'> => {
        const {value} = this.props

        if (!value) {
            return {
                handle: null,
                title: '',
                price: '',
            }
        }

        if (this._isFreeShipping(value)) {
            return {
                handle: 'free',
                title: '',
                price: '',
            }
        }

        return {
            handle: 'custom',
            title: value.get('title'),
            price: value.get('price'),
        }
    }

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
            focusElement(() => this._firstInputElement as HTMLInputElement)
            segmentTracker.logEvent(
                actionName === ShopifyActionType.CreateOrder
                    ? segmentTracker.EVENTS
                          .SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_OPEN
                    : segmentTracker.EVENTS
                          .SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_OPEN
            )
        } else if (onClose) {
            focusElement(() => this._buttonElement as HTMLButtonElement)
        }
    }

    _onKeyDown = (event: KeyboardEvent) => {
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

    _getShippingRateTitle() {
        const {value, availableShippingRates} = this.props
        const {handle} = this.state

        if (!!value && value.get('title')) {
            return value.get('title') as string
        }

        const shippingRate = availableShippingRates.find(
            (availableShippingRate: Map<any, any>) =>
                availableShippingRate.get('handle') === handle
        ) as Map<any, any>

        return shippingRate ? (shippingRate.get('title') as string) : null
    }

    _saveButtonRef = (buttonRef: HTMLButtonElement) => {
        this._buttonElement = buttonRef
    }

    _saveFirstInputRef = (inputRef: HTMLInputElement) => {
        this._firstInputElement = inputRef
    }

    _onHandleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const handle = event.target.value
        this.setState({handle})
    }

    _onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const title = event.target.value
        this.setState({title})
    }

    _onPriceChange = (price: string) => {
        this.setState({price})
    }

    _onSubmit = (event: FormEvent) => {
        const {currencyCode, onChange, actionName} = this.props
        const {handle, title, price} = this.state

        event.preventDefault()
        this._toggle()

        switch (handle) {
            case 'free':
                onChange(
                    fromJS({
                        custom: true,
                        handle: null,
                        price: formatPrice(0, currencyCode),
                        title: ShippingPopover._FREE_SHIPPING_TITLE,
                    })
                )
                break
            case 'custom':
                onChange(
                    fromJS({
                        custom: true,
                        handle: null,
                        price: formatPrice(price, currencyCode),
                        title: title || 'Custom',
                    })
                )
                break
            default:
                onChange(
                    fromJS({
                        custom: false,
                        handle,
                        price: null,
                        title: null,
                    })
                )
                break
        }

        segmentTracker.logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_SHIPPING_POPOVER_APPLY
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_SHIPPING_POPOVER_APPLY,
            {handle}
        )
    }

    _onRemove = () => {
        const {actionName, onChange} = this.props

        this._toggle()
        onChange(fromJS(null))

        this.setState({
            handle: null,
            title: '',
            price: '',
        })

        segmentTracker.logEvent(
            actionName === ShopifyActionType.CreateOrder
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
            actionName === ShopifyActionType.CreateOrder
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
            availableShippingRates,
        } = this.props
        const {isOpen, handle, title, price} = this.state

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
                    <span className={css.title}>
                        {this._getShippingRateTitle()}
                    </span>
                )}
                <Popover
                    placement={placement}
                    isOpen={isOpen}
                    target={id}
                    toggle={this._toggle}
                >
                    <Form onKeyDown={this._onKeyDown} onSubmit={this._onSubmit}>
                        <PopoverBody className="pt-3">
                            {availableShippingRates.map(
                                (
                                    availableShippingRate: Map<any, any>,
                                    index
                                ) => (
                                    <FormGroup
                                        check
                                        className="mb-3"
                                        key={availableShippingRate.get(
                                            'handle'
                                        )}
                                    >
                                        <Label check>
                                            <Input
                                                type="radio"
                                                name="handle"
                                                value={availableShippingRate.get(
                                                    'handle'
                                                )}
                                                required
                                                checked={
                                                    handle ===
                                                    availableShippingRate.get(
                                                        'handle'
                                                    )
                                                }
                                                tabIndex={0}
                                                innerRef={
                                                    index === 0
                                                        ? this
                                                              ._saveFirstInputRef
                                                        : null
                                                }
                                                onChange={this._onHandleChange}
                                            />
                                            <span className="d-inline-block ml-1">
                                                <span className="d-block">
                                                    {availableShippingRate.get(
                                                        'title'
                                                    )}
                                                    <br />
                                                    <MoneyAmount
                                                        currencyCode={
                                                            currencyCode
                                                        }
                                                        amount={availableShippingRate.getIn(
                                                            ['price', 'amount']
                                                        )}
                                                    />
                                                </span>
                                            </span>
                                        </Label>
                                    </FormGroup>
                                )
                            )}
                            <FormGroup check className="mb-3">
                                <Label check>
                                    <Input
                                        type="radio"
                                        name="handle"
                                        value="free"
                                        required
                                        checked={handle === 'free'}
                                        tabIndex={0}
                                        onChange={this._onHandleChange}
                                    />
                                    <span className="ml-1">Free shipping</span>
                                </Label>
                            </FormGroup>
                            <FormGroup check>
                                <Label check>
                                    <Input
                                        type="radio"
                                        name="handle"
                                        value="custom"
                                        required
                                        checked={handle === 'custom'}
                                        tabIndex={0}
                                        onChange={this._onHandleChange}
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
                                    required={handle === 'custom'}
                                    disabled={handle !== 'custom'}
                                    onChange={this._onTitleChange}
                                />
                                <AmountInput
                                    value={price}
                                    currencyCode={currencyCode}
                                    required={handle === 'custom'}
                                    disabled={handle !== 'custom'}
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
