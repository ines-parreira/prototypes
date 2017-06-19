import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import Popover from './Popover'

import FileField from '../../../../forms/FileField'

import css from '../Toolbar.less'

class AddImage extends React.Component {
    static propTypes = {
        action: PropTypes.object.isRequired,
        functions: PropTypes.object.isRequired,
    }

    state = {
        url: '',
        mode: 'upload',
    }

    _changeMode = (mode) => {
        this.setState({mode})
    }

    _handleImage = (url) => {
        this.props.functions.addImage(url)
        this.popover._close()
    }

    _addImage = () => {
        const url = this.state.url

        if (!url) {
            return
        }

        this.props.functions.addImage(url)
        this.popover._close()
        this.setState({url: ''})
    }

    _onKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()

            if (this.state.url) {
                this._addImage()
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
                icon="fa-file-image-o"
                name={this.props.action.name}
                ref={(popover) => {
                    this.popover = popover
                }}
            >
                <div className={css.menu}>
                    <span
                        onClick={() => this._changeMode('upload')}
                        className={classnames({[css.selected]: this.state.mode === 'upload'})}
                    >
                        Upload
                    </span>
                    <span
                        onClick={() => this._changeMode('url')}
                        className={classnames({[css.selected]: this.state.mode === 'url'})}
                    >
                        URL
                    </span>
                </div>
                {
                    this.state.mode === 'upload' ? (
                            <FileField
                                key="file"
                                accept="image/*"
                                placeholder="Select image..."
                                onChange={this._handleImage}
                                inline
                                noPreview
                            />
                        ) : (
                            <div className="flex">
                                <input
                                    className="form-control"
                                    key="url"
                                    ref="input"
                                    type="text"
                                    placeholder="External image url..."
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
                                    onClick={this._addImage}
                                >
                                    Insert
                                </Button>
                            </div>
                        )
                }
            </Popover>
        )
    }
}

export default AddImage
