import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import {Button, Input} from 'reactstrap'
import _isArray from 'lodash/isArray'

import {notify} from './../../../state/notifications/actions'

import {uploadFiles} from '../../../utils'

import InputField from './InputField'

import css from './FileField.less'

export class FileField extends InputField {
    static propTypes = Object.assign({
        noPreview: PropTypes.bool.isRequired,
        returnFiles: PropTypes.bool.isRequired,
        uploadType: PropTypes.string.isRequired,
    }, InputField.propTypes)

    static defaultProps = {
        noPreview: false,
        placeholder: 'Select a file...',
        returnFiles: false, // return urls of files only by default
        type: 'file',
    }

    state = {
        isUploading: false,
    }

    _onChange = (e) => {
        const files = e.target.files
        this.setState({isUploading: true})

        const filesArray = Array.from(files)

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

        uploadFiles(files, this.props.uploadType).then((files) => {
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
                result = files.map(file => file.url)
            }

            this.props.onChange(result)
        }, (error) => {
            this.setState({isUploading: false})
            let errorMessage = fromJS(error.response).getIn(['data', 'error', 'msg'])

            if (!errorMessage) {
                errorMessage = error.response.status === 413
                    ? 'Failed to upload files. One or more files are larger than the size limit of 10MB.'
                    : 'Failed to upload files. Please try again later.'
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
            returnFiles, // eslint-disable-line
            notify, // eslint-disable-line
            uploadType, // eslint-disable-line
            value,
            ...rest,
        } = this.props

        const {isUploading} = this.state

        const disabled = isUploading

        const previewUrl = _isArray(value) ? value[0] : value

        return (
            <div className="d-flex align-center">
                {
                    !noPreview && previewUrl && (
                        <div className={css.preview}>
                            <img src={previewUrl} />
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
                                <div>
                                    <i className="fa fa-fw fa-circle-o-notch fa-spin mr-2" />
                                    Uploading...
                                </div>
                            ) : (
                                <div>
                                    {placeholder}
                                </div>
                            )
                    }
                    <Input
                        id={this.id}
                        onChange={this._onChange}
                        hidden
                        disabled={disabled}
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
