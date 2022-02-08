import React, {KeyboardEvent, Component} from 'react'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import FileField from '../../../../forms/FileField'
import {ActionInjectedProps} from '../types'
import {getMaxAttachmentSize} from '../../../../../../utils/file'
import {addImage} from '../../utils'

import css from './AddImage.less'
import Popover from './ButtonPopover'

type Props = {
    attachments?: File[]
} & ActionInjectedProps

type State = {
    url: string
    mode: string
    maxSize: number
    isOpen: boolean
}

export default class AddImage extends Component<Props, State> {
    state: State = {
        url: '',
        mode: 'upload',
        maxSize: 0,
        isOpen: false,
    }

    inputRef: Maybe<HTMLInputElement>

    _updateMaxSize = () => {
        const editorState = this.props.getEditorState()
        const maxSize = getMaxAttachmentSize(
            editorState,
            this.props.attachments
        )
        this.setState({maxSize})
    }

    _changeMode = (mode: string) => {
        this.setState({mode})
    }

    _handleImage = (files: Array<{url: string; size: number}>) => {
        files.forEach((file) => {
            this._addImage(file.url, file.size)
        })
        this.setState({isOpen: false})
    }

    _addImage = (url: string, size = 0) => {
        const editorState = this.props.getEditorState()
        const newEditorState = addImage(editorState, url, size)
        this.props.setEditorState(newEditorState)
    }

    _submit = () => {
        const url = this.state.url

        if (!url) {
            return
        }

        this._addImage(url)
        this.setState({
            url: '',
            isOpen: false,
        })
    }

    _onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()

            if (this.state.url) {
                this._submit()
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            this.setState({isOpen: false})
        }
    }

    _onPopoverOpen = () => this.setState({isOpen: true})

    _onPopoverClose = () => this.setState({isOpen: false})

    render() {
        return (
            <Popover
                icon="insert_photo"
                name="Insert image"
                isOpen={this.state.isOpen}
                onOpen={this._onPopoverOpen}
                onClose={this._onPopoverClose}
            >
                <div className={css.menu}>
                    <span
                        onClick={() => this._changeMode('upload')}
                        className={classnames({
                            [css.selected]: this.state.mode === 'upload',
                        })}
                    >
                        Upload
                    </span>
                    <span
                        onClick={() => this._changeMode('url')}
                        className={classnames({
                            [css.selected]: this.state.mode === 'url',
                        })}
                    >
                        URL
                    </span>
                </div>
                {this.state.mode === 'upload' ? (
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
                            ref={(ref) => (this.inputRef = ref)}
                            type="text"
                            placeholder="External image url..."
                            onChange={(e) =>
                                this.setState({url: e.target.value})
                            }
                            value={this.state.url}
                            onKeyDown={this._onKeyDown}
                            autoFocus
                        />
                        <Button
                            type="button"
                            className="ml-2"
                            isDisabled={!this.state.url}
                            onClick={this._submit}
                        >
                            Insert
                        </Button>
                    </div>
                )}
            </Popover>
        )
    }
}
