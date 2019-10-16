//@flow
import * as React from 'react'
import classnames from 'classnames'
import {Popover} from 'reactstrap'

import css from './LinkPopover.less'

type Props = {
    id: string,
    url: string,
    onEdit?: string => void,
    onDelete?: string => void,
    children?: React.Node
}

type State = {
    isOpen: boolean
}

const Button = (props: any) => (
    <button
        {...props}
        type="button"
        className={classnames('btn', 'btn-secondary', 'btn-transparent', css.button, props.className)}
    >
        <i className="material-icons">
            {props.children}
        </i>
    </button>

)

export default class LinkPopover extends React.Component<Props, State> {
    state: State = {
        isOpen: false
    }

    timeout: ?TimeoutID

    componenWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
    }

    _onMouseEnter = (e: SyntheticMouseEvent<*>) => {
        e.preventDefault()
        if (this.timeout) {
            clearTimeout(this.timeout)
        }
        this.setState({isOpen: true})
    }

    _onMouseLeave = (e: SyntheticMouseEvent<*>) => {
        e.preventDefault()
        this.timeout = setTimeout(() => {
            this.setState({isOpen: false})
        }, 250)
    }

    _onEditClick = (e: SyntheticMouseEvent<*>) => {
        e.preventDefault()
        this.props.onEdit && this.props.onEdit(this.props.id)
        this.setState({isOpen: false})
    }

    _onDeleteClick = (e: SyntheticEvent<*>) => {
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
                <Popover
                    isOpen={this.state.isOpen}
                    target={id}
                    placement="bottom-start"
                    className={css.wrapper}
                    innerClassName={css.inner}
                    onMouseEnter={this._onMouseEnter}
                    onMouseLeave={this._onMouseLeave}
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
                        <Button
                            className={css.edit}
                            onClick={this._onEditClick}
                        >
                            edit
                        </Button>
                    )}
                    {this.props.onDelete && (
                        <Button
                            className={css.delete}
                            onClick={this._onDeleteClick}
                        >
                            clear
                        </Button>
                    )}
                </Popover>
            </a>
        )
    }
}
