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
import type {DraftOrderInvoice} from '../../../../../../../../../../../../constants/integrations/types/shopify'
import {focusElement} from '../../../../../../../../../../../../utils/html'
import {ShopifyAction} from '../../../constants'

import css from './EmailInvoicePopover.less'

type Props = {
    id: string,
    actionName: string,
    children: Node,
    placement: string,
    color: string,
    customerEmail: string,
    disabled: boolean,
    onSubmit: (Record<DraftOrderInvoice>) => void,
}

type State = {
    isOpen: boolean,
    to: string,
    customMessage: string,
}

export default class EmailInvoicePopover extends React.PureComponent<
    Props,
    State
> {
    static defaultProps = {
        placement: 'bottom',
    }

    _buttonElement: HTMLButtonElement
    _inputElement: HTMLInputElement

    state = {
        isOpen: false,
        to: this.props.customerEmail,
        customMessage: '',
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
                          .SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_OPEN
                    : segmentTracker.EVENTS
                          .SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_OPEN
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

    _onToChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const to = event.target.value
        this.setState({to})
    }

    _onCustomMessageChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const customMessage = event.target.value
        this.setState({customMessage})
    }

    _onSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        const {actionName, onSubmit} = this.props
        const {to, customMessage} = this.state

        event.preventDefault()
        this._toggle()

        const newValue: DraftOrderInvoice = {
            to,
            custom_message: customMessage,
        }

        onSubmit(fromJS(newValue))

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_SEND
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_SEND
        )
    }

    _onCancel = () => {
        const {actionName} = this.props

        this._toggle()

        segmentTracker.logEvent(
            actionName === ShopifyAction.CREATE_ORDER
                ? segmentTracker.EVENTS
                      .SHOPIFY_CREATE_ORDER_EMAIL_INVOICE_POPOVER_CANCEL
                : segmentTracker.EVENTS
                      .SHOPIFY_DUPLICATE_ORDER_EMAIL_INVOICE_POPOVER_CANCEL
        )
    }

    render() {
        const {id, children, placement, color, disabled} = this.props
        const {isOpen, to, customMessage} = this.state

        return (
            <div>
                <Button
                    id={id}
                    type="button"
                    color={color}
                    className={css.focusable}
                    disabled={disabled}
                    tabIndex={0}
                    innerRef={this._saveButtonRef}
                    onClick={this._toggle}
                >
                    <strong>{children}</strong>
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
                                <Label for="to">To</Label>
                                <Input
                                    type="text"
                                    id="to"
                                    autoComplete="off"
                                    value={to}
                                    required
                                    className={css.toInput}
                                    onChange={this._onToChange}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="custom-message">
                                    Custom message for this customer
                                </Label>
                                <Input
                                    type="textarea"
                                    id="custom-message"
                                    autoComplete="off"
                                    rows={5}
                                    value={customMessage}
                                    innerRef={this._saveInputRef}
                                    onChange={this._onCustomMessageChange}
                                />
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
                                Send notification
                            </Button>
                        </PopoverBody>
                    </Form>
                </Popover>
            </div>
        )
    }
}
