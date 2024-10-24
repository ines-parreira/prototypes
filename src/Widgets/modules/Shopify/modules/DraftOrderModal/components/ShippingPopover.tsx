import classnames from 'classnames'
import {fromJS, Map, List} from 'immutable'
import React, {
    Component,
    ComponentProps,
    ReactNode,
    ChangeEvent,
    FormEvent,
    KeyboardEvent,
    RefObject,
} from 'react'
import {Button, Form, Input, Popover, PopoverBody} from 'reactstrap'

import {formatPrice} from 'business/shopify/number'
import {logEvent, SegmentEvent} from 'common/segment'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'
import RadioButton from 'pages/common/components/RadioButton'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import {focusElement} from 'utils/html'

import AmountInput from 'Widgets/modules/Shopify/modules/AmountInput'
import {ShopifyActionType} from 'Widgets/modules/Shopify/types'

import popoverCss from './Popover.less'
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
    container?: RefObject<HTMLDivElement>
}

type State = {
    isOpen: boolean
    handle: string | null
    title: string
    price?: number
}

export default class ShippingPopover extends Component<Props, State> {
    static _FREE_SHIPPING_TITLE = 'Free shipping'

    static defaultProps: Pick<Props, 'placement'> = {
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
                price: undefined,
            }
        }

        if (this._isFreeShipping(value)) {
            return {
                handle: 'free',
                title: '',
                price: undefined,
            }
        }

        return {
            handle: 'custom',
            title: value.get('title'),
            price: Number(value.get('price')),
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
            logEvent(
                actionName === ShopifyActionType.CreateOrder
                    ? SegmentEvent.ShopifyCreateOrderShippingPopoverOpen
                    : SegmentEvent.ShopifyDuplicateOrderShippingPopoverOpen
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

    _onHandleChange = (newHandle: string) => {
        this.setState({handle: newHandle})
    }

    _onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const title = event.target.value
        this.setState({title})
    }

    _onPriceChange = (price: number) => {
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
                        price: price || 0,
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

        logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderShippingPopoverApply
                : SegmentEvent.ShopifyDuplicateOrderShippingPopoverApply,
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
            price: undefined,
        })

        logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderShippingPopoverRemove
                : SegmentEvent.ShopifyDuplicateOrderShippingPopoverRemove
        )
    }

    _onClose = () => {
        const {actionName} = this.props

        this._toggle()

        logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderShippingPopoverClose
                : SegmentEvent.ShopifyDuplicateOrderShippingPopoverClose
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
            container,
        } = this.props
        const {isOpen, handle, title, price} = this.state

        return (
            <div>
                <Button
                    id={id}
                    type="button"
                    color="link"
                    className={popoverCss.button}
                    disabled={!editable}
                    tabIndex={0}
                    innerRef={this._saveButtonRef}
                    onClick={this._toggle}
                >
                    <strong>{children}</strong>
                </Button>
                {value && (
                    <span className={popoverCss.title}>
                        {this._getShippingRateTitle()}
                    </span>
                )}
                <Popover
                    className={popoverCss.popover}
                    placement={placement}
                    isOpen={isOpen}
                    target={id}
                    toggle={this._toggle}
                    trigger="legacy"
                    container={container?.current ?? document.body}
                >
                    <Form onKeyDown={this._onKeyDown} onSubmit={this._onSubmit}>
                        <PopoverBody className="py-3">
                            {availableShippingRates.map(
                                (
                                    availableShippingRate: Map<any, any>,
                                    index
                                ) => (
                                    <RadioButton
                                        key={availableShippingRate.get(
                                            'handle'
                                        )}
                                        className={css.radioButton}
                                        label={
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
                                        }
                                        name="handle"
                                        value={availableShippingRate.get(
                                            'handle'
                                        )}
                                        isSelected={
                                            handle ===
                                            availableShippingRate.get('handle')
                                        }
                                        ref={
                                            index === 0
                                                ? this._saveFirstInputRef
                                                : null
                                        }
                                        onChange={this._onHandleChange}
                                    />
                                )
                            )}
                            <RadioFieldSet
                                className="mb-3"
                                name="handle"
                                options={[
                                    {value: 'free', label: 'Free shipping'},
                                    {value: 'custom', label: 'Custom'},
                                ]}
                                selectedValue={handle}
                                onChange={this._onHandleChange}
                            />
                            <div className="d-flex mt-1">
                                <Input
                                    type="text"
                                    placeholder="Custom rate name"
                                    autoComplete="off"
                                    value={title}
                                    className={classnames(
                                        popoverCss.titleInput,
                                        css.titleInput
                                    )}
                                    required={handle === 'custom'}
                                    disabled={handle !== 'custom'}
                                    onChange={this._onTitleChange}
                                />
                                <AmountInput
                                    value={price || 0}
                                    currencyCode={currencyCode}
                                    required={handle === 'custom'}
                                    disabled={handle !== 'custom'}
                                    onChange={this._onPriceChange}
                                />
                            </div>
                        </PopoverBody>
                        <hr className="my-0" />
                        <PopoverBody className="d-flex">
                            {!!value ? (
                                <Button
                                    type="button"
                                    color="danger"
                                    tabIndex={0}
                                    onClick={this._onRemove}
                                >
                                    Remove
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    tabIndex={0}
                                    onClick={this._onClose}
                                >
                                    Close
                                </Button>
                            )}
                            <Button
                                color="primary"
                                type="submit"
                                tabIndex={0}
                                className={popoverCss.apply}
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
