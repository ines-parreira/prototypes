import React, {Component, MouseEvent} from 'react'
import {Popover} from 'reactstrap'
import {connect, ConnectedProps} from 'react-redux'

import {RootState} from 'state/types'
import IconButton from 'pages/common/components/button/IconButton'
import {ModalContext} from 'pages/common/components/modal/Modal'

import css from './LinkPopover.less'

type Props = {
    id: string
    url: string
    onEdit?: (arg0: string) => void
    onDelete?: (arg0: string) => void
    children?: React.ReactNode
} & ConnectedProps<typeof connector>

type State = {
    isOpen: boolean
}

export class LinkPopoverContainer extends Component<Props, State> {
    state: State = {
        isOpen: false,
    }

    timeout?: number | null

    componentWillUnmount() {
        if (this.timeout) {
            window.clearTimeout(this.timeout)
        }
    }

    _onMouseEnter = (e: MouseEvent) => {
        const {isEditingLink} = this.props
        e.preventDefault()
        if (this.timeout) {
            window.clearTimeout(this.timeout)
        }
        if (!isEditingLink) {
            this.setState({isOpen: true})
        }
    }

    _onMouseLeave = (e: MouseEvent) => {
        e.preventDefault()
        this.timeout = window.setTimeout(() => {
            this.setState({isOpen: false})
        }, 250)
    }

    _onEditClick = (e: MouseEvent) => {
        e.preventDefault()
        this.props.onEdit && this.props.onEdit(this.props.id)
        this.setState({isOpen: false})
    }

    _onDeleteClick = (e: MouseEvent) => {
        e.preventDefault()
        this.props.onDelete && this.props.onDelete(this.props.id)
    }

    render() {
        const id = `link-${this.props.id}`
        return (
            <a
                id={id}
                href={this.props.url}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={this._onMouseEnter}
                onMouseLeave={this._onMouseLeave}
            >
                {this.props.children}
                <ModalContext.Consumer>
                    {(context) => (
                        <Popover
                            isOpen={this.state.isOpen}
                            target={id}
                            placement="bottom-start"
                            className={css.wrapper}
                            innerClassName={css.inner}
                            onMouseEnter={this._onMouseEnter}
                            onMouseLeave={this._onMouseLeave}
                            trigger="legacy"
                            container={context.ref}
                        >
                            <a
                                className={css.url}
                                href={this.props.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {this.props.url}
                            </a>
                            {this.props.onEdit && (
                                <IconButton
                                    size="small"
                                    intent="secondary"
                                    onClick={this._onEditClick}
                                    className={css.edit}
                                >
                                    edit
                                </IconButton>
                            )}
                            {this.props.onDelete && (
                                <IconButton
                                    size="small"
                                    intent="secondary"
                                    className={css.delete}
                                    onClick={this._onDeleteClick}
                                >
                                    clear
                                </IconButton>
                            )}
                        </Popover>
                    )}
                </ModalContext.Consumer>
            </a>
        )
    }
}

const connector = connect((state: RootState) => ({
    isEditingLink: state.ui.editor.isEditingLink,
}))

export default connector(LinkPopoverContainer)
