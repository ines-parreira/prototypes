// @flow

import React, {type Node} from 'react'
import {
    Button,
    Form,
    FormGroup,
    Input,
    InputGroup,
    InputGroupAddon,
    Label,
    Popover,
    PopoverBody,
} from 'reactstrap'
import {fromJS, type Record} from 'immutable'
import classnames from 'classnames'

import * as segmentTracker from '../../../../../../../../../../../../store/middlewares/segmentTracker'
import {getDiscountAmount} from '../../../../../../../../../../../../business/shopify/discount'
import type {
    AppliedDiscount,
    DiscountType,
} from '../../../../../../../../../../../../constants/integrations/types/shopify'
import {
    formatPercentage,
    formatPrice,
} from '../../../../../../../../../../../../business/shopify/number'
import {focusElement} from '../../../../../../../../../../../../utils/html'
import ShopifyMoneySymbol from '../../MoneySymbol'
import AmountInput from '../../AmountInput'
import {ShopifyAction} from '../../../constants'

import css from './DiscountPopover.less'

type Props = {
    id: string,
    label: string,
    actionName: string,
    children: Node,
    placement: string,
    editable: boolean,
    currencyCode: string,
    max: number,
    value: Record<AppliedDiscount> | null,
    onChange: (Record<AppliedDiscount> | null) => void,
}

type State = {
    isOpen: boolean,
    type: DiscountType,
    discountValue: string,
    title: string,
}

export default class DiscountPopover extends React.PureComponent<Props, State> {
    static defaultProps = {
        placement: 'bottom',
    }

    _buttonElement: HTMLButtonElement
    _inputElement: HTMLInputElement

    state = {
        isOpen: false,
        type: this.props.value
            ? this.props.value.get('value_type') || 'fixed_amount'
            : 'fixed_amount',
        discountValue: this.props.value
            ? this.props.value.get('value') || ''
            : '',
        title: this.props.value ? this.props.value.get('title') || '' : '',
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
                          .SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_OPEN
                    : segmentTracker.EVENTS
                          .SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_OPEN
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

    _onFixedAmountClicked = (event: SyntheticInputEvent<HTMLButtonElement>) => {
        event.preventDefault()

        const {currencyCode} = this.props
        const {discountValue} = this.state

        this.setState({
            type: 'fixed_amount',
            discountValue: formatPrice(discountValue, currencyCode),
        })
    }

    _onPercentageClicked = (event: SyntheticInputEvent<HTMLButtonElement>) => {
        event.preventDefault()

        const {discountValue} = this.state

        this.setState({
            type: 'percentage',
            discountValue: formatPercentage(discountValue),
        })
    }

    _saveButtonRef = (buttonRef: HTMLButtonElement) => {
        this._buttonElement = buttonRef
    }

    _saveInputRef = (inputRef: HTMLInputElement) => {
        this._inputElement = inputRef
    }

    _onDiscountValueChange = (discountValue: string) => {
        this.setState({discountValue})
    }

    _onTitleChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const title = event.target.value
        this.setState({title})
    }

    _onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        const {max, currencyCode, actionName, onChange} = this.props
        const {title, type, discountValue} = this.state
        const value = formatPrice(discountValue, currencyCode)

        event.preventDefault()
        this._toggle()

        const newValue: AppliedDiscount = {
            title,
            value,
            value_type: type,
            amount: formatPrice(
                getDiscountAmount(max, type, value),
                currencyCode,
                true
            ),
        }

        onChange(fromJS(newValue))

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_APPLY
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_APPLY
        )
    }

    _onRemove = () => {
        const {actionName, onChange} = this.props

        this._toggle()
        onChange(null)

        this.setState({
            type: 'fixed_amount',
            discountValue: '',
            title: '',
        })

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_REMOVE
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_REMOVE
        )
    }

    _onClose = () => {
        const {actionName} = this.props

        this._toggle()

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_DISCOUNT_POPOVER_CLOSE
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_DISCOUNT_POPOVER_CLOSE
        )
    }

    render() {
        const {
            id,
            label,
            children,
            placement,
            currencyCode,
            editable,
            value,
            max,
        } = this.props
        const {isOpen, type, discountValue, title} = this.state
        const discountValueMax = type === 'percentage' ? 100 : max
        const discountValueSymbol = type === 'percentage' ? '%' : null

        return (
            <div>
                <Button
                    id={id}
                    type="button"
                    color="link"
                    className={classnames('p-0', css.button, css.focusable)}
                    disabled={!editable}
                    tabIndex={0}
                    innerRef={this._saveButtonRef}
                    onClick={this._toggle}
                >
                    <strong>{children}</strong>
                </Button>
                {value && value.get('title') ? (
                    <span className={css.title}>{value.get('title')}</span>
                ) : null}
                <Popover
                    placement={placement}
                    isOpen={isOpen}
                    target={id}
                    toggle={this._toggle}
                >
                    <Form onKeyDown={this._onKeyDown} onSubmit={this._onSubmit}>
                        <PopoverBody className="pt-3">
                            <FormGroup>
                                <Label for="discount-value">
                                    Discount this {label} by
                                </Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            onClick={this._onFixedAmountClicked}
                                            className={css.focusable}
                                            tabIndex={0}
                                        >
                                            <ShopifyMoneySymbol
                                                currencyCode={currencyCode}
                                                short
                                            />
                                        </Button>
                                    </InputGroupAddon>
                                    <InputGroupAddon addonType="prepend">
                                        <Button
                                            onClick={this._onPercentageClicked}
                                            className={css.focusable}
                                            tabIndex={0}
                                        >
                                            %
                                        </Button>
                                    </InputGroupAddon>
                                    <AmountInput
                                        value={discountValue}
                                        id="discount-value"
                                        max={discountValueMax}
                                        symbol={discountValueSymbol}
                                        currencyCode={currencyCode}
                                        saveInputRef={this._saveInputRef}
                                        onChange={this._onDiscountValueChange}
                                    />
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <Label for="title">Reason</Label>
                                <Input
                                    type="text"
                                    id="title"
                                    placeholder="Damaged item, loyalty discount"
                                    autoComplete="off"
                                    value={title}
                                    className={css.titleInput}
                                    onChange={this._onTitleChange}
                                />
                            </FormGroup>
                        </PopoverBody>
                        <hr className="m-0" />
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
