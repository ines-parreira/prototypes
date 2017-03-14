import React, {PropTypes} from 'react'
import classnames from 'classnames'
import Popover from './Popover'
import {uploadFiles} from '../../../../../../utils'

import css from '../Toolbar.less'

class AddImage extends React.Component {
    static propTypes = {
        action: PropTypes.object.isRequired,
        functions: PropTypes.object.isRequired,
    }

    state = {
        url: '',
        mode: 'upload',
        isUploading: false,
    }

    _changeMode = (mode) => {
        this.setState({mode})
    }

    _handleFiles = (files) => {
        this.setState({isUploading: true})
        uploadFiles(files).then((images) => {
            if (images.length < 1) {
                return
            }

            const image = images[0]
            const url = image.url

            if (!url) {
                return
            }

            this.props.functions.addImage(url)
            this.popover._close()
            this.setState({isUploading: false})
        })
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
                icon="file image outline"
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
                            <div>
                                {
                                    this.state.isUploading ? (
                                            <span>
                                                <i className="notched circle loading icon" />
                                                <span className="ml5i">Uploading...</span>
                                            </span>
                                        ) : (
                                            <input
                                                key="file"
                                                type="file"
                                                accept="image/*"
                                                onChange={e => this._handleFiles(e.target.files)}
                                            />
                                        )
                                }
                            </div>
                        ) : (
                            <div className="flex">
                                <input
                                    key="url"
                                    ref="input"
                                    type="text"
                                    placeholder="External image url..."
                                    onChange={e => this.setState({url: e.target.value})}
                                    value={this.state.url}
                                    onKeyDown={this._onKeyDown}
                                    autoFocus
                                />
                                <button
                                    className="ui small green button ml5i"
                                    type="button"
                                    disabled={!this.state.url}
                                    onClick={this._addImage}
                                >
                                    Insert
                                </button>
                            </div>
                        )
                }
            </Popover>
        )
    }
}

export default AddImage
