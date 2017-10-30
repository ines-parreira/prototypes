// @flow
import React from 'react'
import classnames from 'classnames'
import {
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'
import _get from 'lodash/get'
import _noop from 'lodash/noop'

import type {Node} from 'react'

type Props = {
    id?: string,
    type?: 'button' | 'submit',
    className?: string,
    disabled?: boolean,
    confirm: () => void,
    title?: string,
    content?: Node,
    children?: Node,
    skip?: boolean,
    loading?: boolean,
    placement?: string
}

type State = {
    loading: boolean,
    showConfirmation: boolean
}

export default class ConfirmButton extends React.Component<Props, State> {
    static defaultProps = {
        id: '',
        type: 'button',
        className: '',
        disabled: false,
        confirm: _noop,
        title: 'Are you sure?',
        content: null,
        skip: false,
        loading: false,
        placement: 'bottom'
    }

    state = {
        loading: false,
        showConfirmation: false
    }

    _form: ?HTMLElement = null
    _mounted: boolean = false

    componentWillMount() {
        this._mounted = true
    }

    componentWillUnmount() {
        this._mounted = false
    }

    _showConfirmation = (e: Event) => {
        const form: HTMLFormElement = _get(e, ['target', 'form'])
        if (this.props.type === 'submit' && !!form) {
            // don't show popover for invalid forms
            if (!form.checkValidity()) {
                return
            }

            // stop real submit,
            // we'll trigger it from the confirm button.
            this._form = form
            e.preventDefault()
        }

        if (this.props.skip) {
            return this._confirmAction()
        }

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
        if (this.props.type === 'submit') {
            this.setState({showConfirmation: false})

            this.props.confirm()
            // popover is outside the form,
            // so we need to simulate the submit.
            // _form can be null.
            if (this._form) {
                this._form.dispatchEvent(new Event('submit'))
            }
            return
        }

        this.setState({
            loading: true,
            showConfirmation: false
        })

        Promise
            .resolve(this.props.confirm())
            .then(this._hideLoading)
            .catch(this._hideLoading)
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
            ...buttonProps
        } = this.props

        const {
            showConfirmation
        } = this.state

        const isLoading = this.state.loading || loading

        const uid = `confirm-button-${id || Date.now()}`

        return (
            <div className={classnames('d-inline-block', className)} id={id}>
                <Button
                    id={uid}
                    type={type}
                    disabled={isLoading || disabled}
                    onClick={this._showConfirmation}
                    className={classnames({
                        'btn-loading': isLoading
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
                >
                    <PopoverTitle>{title}</PopoverTitle>
                    <PopoverContent>
                        <p>
                            {content}
                        </p>

                        <Button
                            type="submit"
                            color="success"
                            onClick={this._confirmAction}
                        >
                            Confirm
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        )
    }

}
