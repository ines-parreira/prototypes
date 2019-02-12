// @flow
import React from 'react'
import classnames from 'classnames'
import {
    Button,
    Popover,
    PopoverHeader,
    PopoverBody,
} from 'reactstrap'
import _get from 'lodash/get'
import _noop from 'lodash/noop'

import type {Node} from 'react'

import css from './ConfirmButton.less'


type Props = {
    id?: string,
    type?: 'button' | 'submit',
    className?: string,
    disabled?: boolean,
    confirm: () => void | Promise<*>,
    title?: string,
    content?: Node,
    children?: Node,
    skip?: boolean,
    loading?: boolean,
    placement?: string,
    confirmColor?: string,
    buttonClassName?: string,
}

type State = {
    loading: boolean,
    showConfirmation: boolean
}

export default class ConfirmButton extends React.Component<Props, State> {
    static defaultProps = {
        type: 'button',
        className: '',
        disabled: false,
        confirm: _noop,
        title: 'Are you sure?',
        content: null,
        skip: false,
        loading: false,
        placement: 'bottom',
        confirmColor: 'success',
    }

    state = {
        loading: false,
        showConfirmation: false
    }

    dateId: number

    _container: ?HTMLElement = null
    _mounted: boolean = false

    constructor(props: Props) {
        super(props)
        this.dateId = Date.now()
    }

    componentWillMount() {
        this._mounted = true
    }

    componentWillUnmount() {
        this._mounted = false
    }

    _showConfirmation = (e: Event) => {
        if (this.props.type === 'submit') {
            const form: HTMLFormElement = _get(e, ['target', 'form'])
            if (
                !!form
                && !form.checkValidity()
            ) {
                // don't show popover for invalid forms
                return
            }
        }

        if (this.props.skip) {
            return this.props.confirm()
        }

        e.preventDefault()
        this.setState({showConfirmation: true})
    }

    _hideConfirmation = () => {
        this.setState({showConfirmation: false})
    }

    _hideLoading = () => {
        if (!this._mounted) {
            return
        }

        this.setState({loading: false})
    }

    _confirmAction = () => {
        this.setState({loading: true})

        // HACK if the popover hides immediately onClick
        // the submit event is not triggered.
        setTimeout(this._hideConfirmation)

        Promise
            .resolve(this.props.confirm())
            .then(this._hideLoading)
            .catch(this._hideLoading)
    }

    _popoverContainer = () => {
        if (this.props.type === 'submit' && this._container) {
            // keep submit popovers in form
            return this._container.closest('form')
        }

        return 'body'
    }

    render() {
        const {
            id,
            type,
            className,
            disabled,
            title,
            content,
            loading,
            confirm, // eslint-disable-line no-unused-vars
            skip, // eslint-disable-line no-unused-vars
            placement,
            confirmColor,
            buttonClassName,
            ...buttonProps
        } = this.props

        const {
            showConfirmation
        } = this.state

        const isLoading = this.state.loading || loading

        const uid = `confirm-button-${id || this.dateId}`

        return (
            <div
                className={classnames(css.component, 'd-inline-block', className)}
                id={id}
                ref={(container) => this._container = container}
            >
                <Button
                    id={uid}
                    type={type}
                    disabled={isLoading || disabled}
                    onClick={this._showConfirmation}
                    className={classnames(buttonClassName, {
                        [`${css.loading} btn-loading`]: isLoading
                    })}
                    {...buttonProps}
                >
                    {this.props.children}
                </Button>
                <Popover
                    placement={placement}
                    isOpen={showConfirmation}
                    target={uid}
                    toggle={this._hideConfirmation}
                    container={this._popoverContainer()}
                >
                    <PopoverHeader>{title}</PopoverHeader>
                    <PopoverBody>
                        <p>
                            {content}
                        </p>

                        <Button
                            type={type}
                            color={confirmColor}
                            onClick={this._confirmAction}
                        >
                            Confirm
                        </Button>
                    </PopoverBody>
                </Popover>
            </div>
        )
    }

}
