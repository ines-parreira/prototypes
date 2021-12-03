import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Input} from 'reactstrap'
import classnames from 'classnames'
import _isArray from 'lodash/isArray'
import {AxiosError} from 'axios'
import {InputType} from 'reactstrap/lib/Input'
import _omit from 'lodash/omit'

import {uploadFiles} from '../../../utils'
import {getFileTooLargeError} from '../../../utils/file'
import {notify} from '../../../state/notifications/actions'
import {NotificationStatus} from '../../../state/notifications/types'

import InputField from './InputField'
import css from './FileField.less'

const DEFAULT_ERROR = 'Failed to upload files. Please try again later.'

type Props = {
    className?: string
    noPreview: boolean
    returnFiles: boolean
    uploadType?: string
    maxSize?: number
    params?: Record<string, unknown>
    type: InputType
    accept?: string
    onClick?: () => void
} & ConnectedProps<typeof connector> &
    ComponentProps<typeof InputField>

type State = {
    isUploading: boolean
}

export class FileFieldContainer extends InputField<Props, State> {
    static defaultProps: Pick<
        Props,
        'noPreview' | 'placeholder' | 'returnFiles' | 'type' | 'maxSize'
    > = {
        noPreview: false,
        placeholder: 'Select a File...',
        returnFiles: false, // return urls of files only by default
        type: 'file',
        maxSize: 0,
    }

    state = {
        isUploading: false,
    }

    id?: string

    _getFilesSize = (files: File[]) => {
        return files.reduce((sum, file) => sum + (file.size || 0), 0)
    }

    _onChange = (event: {
        target: {
            files: FileList
        }
    }) => {
        const files = event.target.files
        const filesArray = Array.from(files)
        if (
            this.props.maxSize &&
            this._getFilesSize(filesArray) > this.props.maxSize
        ) {
            return this.props.notify({
                status: NotificationStatus.Error,
                message: getFileTooLargeError(this.props.maxSize),
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
            void this.props.notify({
                type: NotificationStatus.Error,
                status: NotificationStatus.Warning,
                message: 'Uploading SVGs is not allowed.',
            })
            this.setState({isUploading: false})
            return
        }

        uploadFiles(files, {
            type: this.props.uploadType,
            ...this.props.params,
        }).then(
            (files) => {
                this.setState({isUploading: false})

                // if we want to return files, return them otherwise return urls only
                if (this.props.returnFiles) {
                    return this.props.onChange!(files)
                }

                if (files.length < 1) {
                    return
                }

                const image = files[0]
                let result: string | string[] = image.url

                if (!result) {
                    return
                }

                if (files.length > 1) {
                    result = files.map((file) => file.url)
                }

                this.props.onChange!(result)
            },
            (error) => {
                this.setState({isUploading: false})
                const errorMessage = (
                    fromJS((error as AxiosError).response) as Map<any, any>
                ).getIn(['data', 'error', 'msg'], DEFAULT_ERROR)

                if ((error as AxiosError).response?.status === 413) {
                    return this.props.notify({
                        status: NotificationStatus.Error,
                        message: getFileTooLargeError(this.props.maxSize!),
                    })
                }

                void this.props.notify({
                    type: NotificationStatus.Error,
                    status: NotificationStatus.Error,
                    message: errorMessage,
                })
            }
        )
    }

    _getField = () => {
        const {noPreview, placeholder, className, value} = this.props

        const {isUploading} = this.state

        const disabled = isUploading

        const previewUrl = _isArray(value) ? value[0] : value

        return (
            <div className="d-flex align-center">
                {!noPreview && previewUrl && (
                    <div className={css.preview}>
                        <img alt="file preview" src={previewUrl} />
                    </div>
                )}

                <Button
                    className={css.label}
                    tag="label"
                    color="secondary"
                    disabled={disabled}
                >
                    {isUploading ? (
                        <span>
                            <i className="material-icons md-spin mr-2">
                                refresh
                            </i>
                            Uploading...
                        </span>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <Input
                        id={this.id}
                        onChange={this._onChange as any}
                        disabled={disabled}
                        className={classnames(css.input, className)}
                        {..._omit(this.props, [
                            'children',
                            'error',
                            'help',
                            'inline',
                            'label',
                            'noPreview',
                            'onChange',
                            'placeholder',
                            'className',
                            'returnFiles',
                            'notify',
                            'uploadType',
                            'maxSize',
                            'value',
                        ])}
                    />
                </Button>
            </div>
        )
    }
}

const connector = connect(null, {notify})

export default connector(FileFieldContainer)
