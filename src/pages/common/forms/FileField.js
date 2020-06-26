// @flow
import React from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {Button, Input} from 'reactstrap'
import classnames from 'classnames'
import _isArray from 'lodash/isArray'


import type {attachmentType} from '../../../state/types'
import {uploadFiles} from '../../../utils'
import {getFileTooLargeError} from '../../../utils/file'

import {notify} from './../../../state/notifications/actions'

import InputField from './InputField'

import css from './FileField.less'

const DEFAULT_ERROR = 'Failed to upload files. Please try again later.'

type Props = {
    noPreview: boolean,
    returnFiles: boolean,
    uploadType?: string,
    maxSize?: number,
    params?: Object
}

type State = {
    isUploading: boolean
}

export class FileField extends InputField<Props, State> {
    static defaultProps = {
        noPreview: false,
        placeholder: 'Select a file...',
        returnFiles: false, // return urls of files only by default
        type: 'file',
        maxSize: 0,
    }

    state = {
        isUploading: false,
    }

    _getFilesSize = (files: Array<attachmentType>) => {
        return files.reduce((sum, file) => sum + (file.size || 0), 0)
    }

    // TODO (@ghinda) switch to SyntheticEvent<HTMLInputElement> after react upgrade
    _onChange = (event: {target: {files: FileList}}) => {
        const files = event.target.files
        const filesArray = Array.from(files)
        if (this.props.maxSize && this._getFilesSize(filesArray) > this.props.maxSize) {
            return this.props.notify({
                status: 'error',
                message: getFileTooLargeError(this.props.maxSize)
            })
        }

        this.setState({isUploading: true})

        let isSvg = false

        filesArray.forEach((file) => {
            if (file.type.endsWith('svg+xml')) {
                isSvg = true
            }
        })

        if (isSvg) {
            this.props.notify({
                type: 'error',
                status: 'warning',
                message: 'Uploading SVGs is not allowed.'
            })
            this.setState({isUploading: false})
            return
        }

        uploadFiles(files, {type: this.props.uploadType, ...this.props.params}).then((files) => {
            this.setState({isUploading: false})

            // if we want to return files, return them otherwise return urls only
            if (this.props.returnFiles) {
                return this.props.onChange(files)
            }

            if (files.length < 1) {
                return
            }

            const image = files[0]
            let result = image.url

            if (!result) {
                return
            }

            if (files.length > 1) {
                result = files.map((file) => file.url)
            }

            this.props.onChange(result)
        }, (error) => {
            this.setState({isUploading: false})
            let errorMessage = fromJS(error.response).getIn(['data', 'error', 'msg'], DEFAULT_ERROR)

            if (error.response.status === 413) {
                return this.props.notify({
                    status: 'error',
                    message: getFileTooLargeError(this.props.maxSize)
                })
            }

            this.props.notify({
                type: 'error',
                status: 'error',
                message: errorMessage
            })
        })
    }

    _getField = () => {
        const {
            children, // eslint-disable-line
            error, // eslint-disable-line
            help, // eslint-disable-line
            inline, // eslint-disable-line
            label, // eslint-disable-line
            noPreview,
            onChange, // eslint-disable-line
            placeholder,
            className,
            returnFiles, // eslint-disable-line
            notify, // eslint-disable-line
            uploadType, // eslint-disable-line
            maxSize, // eslint-disable-line
            value,
            ...rest
        } = this.props

        const {isUploading} = this.state

        const disabled = isUploading

        const previewUrl = _isArray(value) ? value[0] : value

        return (
            <div className="d-flex align-center">
                {
                    !noPreview && previewUrl && (
                        <div className={css.preview}>
                            <img
                                alt="file preview"
                                src={previewUrl}
                            />
                        </div>
                    )
                }

                <Button
                    className={css.label}
                    tag="label"
                    color="secondary"
                    disabled={disabled}
                >
                    {
                        isUploading ? (
                            <span>
                                <i className="material-icons md-spin mr-2">
                                        refresh
                                </i>
                                    Uploading...
                            </span>
                        ) : (
                            <span>
                                {placeholder}
                            </span>
                        )
                    }
                    <Input
                        id={this.id}
                        onChange={this._onChange}
                        disabled={disabled}
                        className={classnames(css.input, className)}
                        {...rest}
                    />
                </Button>
            </div>
        )
    }
}

export default connect(null, {
    notify
})(FileField)
