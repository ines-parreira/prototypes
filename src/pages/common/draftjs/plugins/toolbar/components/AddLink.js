import React, {PropTypes} from 'react'
import {Button} from 'reactstrap'

import Popover from './Popover'

class AddLink extends React.Component {
    static propTypes = {
        action: PropTypes.object.isRequired,
        functions: PropTypes.object.isRequired,
        isActive: PropTypes.bool.isRequired,
        isDisabled: PropTypes.bool.isRequired,
    }

    state = {
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

        this.props.functions.addLink(url)
        this.popover._close()
        this.setState({url: ''})
    }

    _onKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()

            if (this.state.url) {
                this._addLink()
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            this.popover._close()
        }
    }

    render() {
        return (
            <Popover
                icon="linkify"
                name={this.props.action.name}
                isActive={this.props.isActive}
                isDisabled={this.props.isDisabled}
                onIconClick={this.props.functions.onClick}
                ref={(popover) => {
                    this.popover = popover
                }}
            >
                <div className="flex">
                    <input
                        ref="input"
                        type="text"
                        placeholder="External url..."
                        onChange={e => this.setState({url: e.target.value})}
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

export default AddLink
