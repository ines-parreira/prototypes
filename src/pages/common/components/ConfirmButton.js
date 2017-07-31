import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {
    Button,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'
import _noop from 'lodash/noop'

export default class ConfirmButton extends React.Component {
    form = null

    state = {
        loading: false,
        showConfirmation: false
    }

    componentWillMount() {
        this.mounted = true
    }

    componentWillUnmount() {
        this.mounted = false
    }

    _showConfirmation = (e) => {
        if (this.props.type === 'submit' && !!e.target.form) {
            // don't show popover for invalid forms
            if (!e.target.form.checkValidity()) {
                return
            }

            // stop real submit,
            // we'll trigger it from the confirm button.
            this.form = e.target.form
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
        if (!this.mounted) {
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
            this.form.dispatchEvent(new Event('submit'))
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

ConfirmButton.propTypes = {
    id: PropTypes.string,
    type: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    confirm: PropTypes.func,
    title: PropTypes.string,
    content: PropTypes.node,
    children: PropTypes.node,
    skip: PropTypes.bool,
    loading: PropTypes.bool,
    placement: PropTypes.string
}


ConfirmButton.defaultProps = {
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
