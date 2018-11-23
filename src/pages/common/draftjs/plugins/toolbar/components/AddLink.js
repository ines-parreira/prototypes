//@flow
import React, { type ElementRef } from 'react'
import {Button} from 'reactstrap'
import Popover from './Popover'
import type { ActionComponentProps } from '../types'

type Props = {
    onClick: () => boolean,
    onAddLink: (url: string) => void
} & ActionComponentProps

type State = {
    url: string
}

export default class AddLink extends React.Component<Props, State> {
    popover: ?ElementRef<typeof Popover>

    state: State = {
        url: '',
    }

    _addLink = () => {
        const url = this.state.url

        if (!url) {
            return
        }

        if (this.props.isDisabled) {
            return
        }

        this.props.onAddLink(url)
        if (this.popover) {
            this.popover._close()
        }
        this.setState({url: ''})
    }

    _onKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()

            if (this.state.url) {
                this._addLink()
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            this.popover && this.popover._close()
        }
    }

    _onUrlChange = (e: SyntheticInputEvent<HTMLInputElement>) =>
        this.setState({url: e.target.value})

    render() {
        return (
            <Popover
                icon="link"
                name={this.props.name}
                isActive={this.props.isActive}
                isDisabled={this.props.isDisabled}
                onIconClick={this.props.onClick}
                ref={(popover: ?ElementRef<typeof Popover>) => {
                    this.popover = popover
                }}
            >
                <div className="flex">
                    <input
                        className="form-control"
                        ref="input"
                        type="text"
                        placeholder="External url..."
                        onChange={this._onUrlChange}
                        value={this.state.url}
                        onKeyDown={this._onKeyDown}
                        autoFocus
                    />
                    <Button
                        type="button"
                        color="primary"
                        className="ml-2"
                        disabled={!this.state.url}
                        onClick={this._addLink}
                    >
                        Insert
                    </Button>
                </div>
            </Popover>
        )
    }
}
