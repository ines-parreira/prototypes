import React, {
    Component,
    ComponentProps,
    ReactNode,
    KeyboardEvent,
    FormEvent,
} from 'react'
import classnames from 'classnames'
import {Button, Form, Popover, PopoverBody} from 'reactstrap'

import CheckBox from 'pages/common/forms/CheckBox'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {focusElement} from 'utils/html'
import {ShopifyActionType} from '../../../types'

import css from './TaxesPopover.less'

type Props = {
    id: string
    actionName: ShopifyActionType
    children: ReactNode
    placement: ComponentProps<typeof Popover>['placement']
    editable: boolean
    value: boolean
    onChange: (arg0: boolean) => void
}

type State = {
    isOpen: boolean
    taxExempt: boolean
}

export default class TaxesPopover extends Component<Props, State> {
    static defaultProps: Pick<Props, 'placement'> = {
        placement: 'bottom',
    }

    _buttonElement?: HTMLButtonElement
    _inputElement?: HTMLInputElement

    state = {
        isOpen: false,
        taxExempt: this.props.value,
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const {actionName} = this.props
        const {isOpen} = this.state
        const {isOpen: wasOpen} = prevState

        const onOpen = !wasOpen && isOpen
        const onClose = wasOpen && !isOpen

        if (onOpen) {
            focusElement(() => this._inputElement as HTMLInputElement)
            logEvent(
                actionName === ShopifyActionType.CreateOrder
                    ? SegmentEvent.ShopifyCreateOrderTaxesPopoverOpen
                    : SegmentEvent.ShopifyDuplicateOrderTaxesPopoverOpen
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

    _saveButtonRef = (buttonRef: HTMLButtonElement) => {
        this._buttonElement = buttonRef
    }

    _saveInputRef = (inputRef: HTMLInputElement) => {
        this._inputElement = inputRef
    }

    _onChargeTaxesChange = (newValue: boolean) => {
        this.setState({taxExempt: !newValue})
    }

    _onSubmit = (event: FormEvent) => {
        const {actionName, onChange} = this.props
        const {taxExempt} = this.state

        event.preventDefault()
        this._toggle()
        onChange(taxExempt)

        logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderTaxesPopoverApply
                : SegmentEvent.ShopifyDuplicateOrderTaxesPopoverApply
        )
    }

    _onClose = () => {
        const {actionName} = this.props

        this._toggle()

        logEvent(
            actionName === ShopifyActionType.CreateOrder
                ? SegmentEvent.ShopifyCreateOrderTaxesPopoverClose
                : SegmentEvent.ShopifyDuplicateOrderTaxesPopoverClose
        )
    }

    render() {
        const {id, children, placement, editable} = this.props
        const {isOpen, taxExempt} = this.state

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
                <Popover
                    placement={placement}
                    isOpen={isOpen}
                    target={id}
                    toggle={this._toggle}
                    trigger="legacy"
                >
                    <Form onKeyDown={this._onKeyDown} onSubmit={this._onSubmit}>
                        <PopoverBody className="py-3">
                            <p className={css.legend}>
                                Taxes are automatically calculated.
                            </p>
                            <CheckBox
                                isChecked={!taxExempt}
                                tabIndex={0}
                                ref={this._saveInputRef}
                                onChange={this._onChargeTaxesChange}
                            >
                                Charge taxes
                            </CheckBox>
                        </PopoverBody>
                        <hr className="my-0" />
                        <PopoverBody className="d-flex">
                            <Button
                                type="button"
                                tabIndex={0}
                                className={css.focusable}
                                onClick={this._onClose}
                            >
                                Close
                            </Button>
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
