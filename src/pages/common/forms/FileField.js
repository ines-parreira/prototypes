import React, {PropTypes} from 'react'
import {Button, Input} from 'reactstrap'
import _isArray from 'lodash/isArray'

import {uploadFiles} from '../../../utils'

import InputField from './InputField'

import css from './FileField.less'

export default class FileField extends InputField {
    static propTypes = Object.assign({
        noPreview: PropTypes.bool.isRequired,
        returnFiles: PropTypes.bool.isRequired,
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
        uploadFiles(files).then((files) => {
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
