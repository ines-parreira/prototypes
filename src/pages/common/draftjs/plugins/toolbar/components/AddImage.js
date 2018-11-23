//@flow
import React, { type ElementRef }  from 'react'
import classnames from 'classnames'
import {Button} from 'reactstrap'
import Popover from './Popover'
import FileField from '../../../../forms/FileField'
import css from '../Toolbar.less'
import type { ActionComponentProps } from '../types'

type Props = {
    onAddImage: (string, maxSize?: number) => void,
    getMaxAttachmentSize: () => number
} & ActionComponentProps

type State = {
    url: string,
    mode: string,
    maxSize: number
}

export default class AddImage extends React.Component<Props, State> {
    popover: ?ElementRef<typeof Popover>

    state = {
        url: '',
        mode: 'upload',
        maxSize: 0
    }

    _updateMaxSize = () => {
        const maxSize = this.props.getMaxAttachmentSize()
        this.setState({maxSize})
    }

    _changeMode = (mode: string) => {
        this.setState({mode})
    }

    _handleImage = (files: Array<{ url: string, size: number}>) => {
        files.forEach((file) => {
            this.props.onAddImage(file.url, file.size)
        })
        this.popover && this.popover._close()
    }

    _addImage = () => {
        const url = this.state.url

        if (!url) {
            return
        }

        this.props.onAddImage(url)
        this.popover && this.popover._close()
        this.setState({url: ''})
    }

    _onKeyDown = (e: SyntheticKeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()

            if (this.state.url) {
                this._addImage()
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            this.popover && this.popover._close()
        }
    }

    render() {
        return (
            <Popover
                icon="insert_photo"
                name={this.props.name}
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
                                onClick={this._updateMaxSize}
                                onChange={this._handleImage}
                                maxSize={this.state.maxSize}
                                returnFiles
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
