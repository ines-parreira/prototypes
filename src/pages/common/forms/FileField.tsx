import React, {createRef, RefObject} from 'react'
import {fromJS, Map} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import {Input} from 'reactstrap'
import classnames from 'classnames'
import _isArray from 'lodash/isArray'
import {AxiosError} from 'axios'
import {InputType} from 'reactstrap/lib/Input'
import _omit from 'lodash/omit'

import {uploadFiles} from 'utils'
import {getFileTooLargeError} from 'utils/file'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'

import InputField, {InputFieldProps} from './InputField'
import css from './FileField.less'

const DEFAULT_ERROR = 'Failed to upload files. Please try again later.'

export enum UploadType {
    Profile = 'profile_picture',
    Widget = 'widget_picture',
    Avatar = 'avatar_team_picture',
}

export type Props = {
    noPreview?: boolean
    returnFiles?: boolean
    isRemovable?: boolean
    uploadType?: UploadType
    maxSize?: number
    params?: Record<string, unknown>
    type?: InputType
    accept?: string
    onClick?: () => void
} & ConnectedProps<typeof connector> &
    InputFieldProps<string | string[]>

type State = {
    isUploading: boolean
}

export class FileFieldContainer extends InputField<Props> {
    static defaultProps: Pick<
        Props,
        | 'noPreview'
        | 'placeholder'
        | 'returnFiles'
        | 'type'
        | 'maxSize'
        | 'isRemovable'
    > = {
        noPreview: false,
        placeholder: 'Select a File...',
        returnFiles: false, // return urls of files only by default
        isRemovable: false,
        type: 'file',
        maxSize: 0,
    }

    state: State = {
        isUploading: false,
    }

    id?: string

    inputRef: RefObject<HTMLInputElement>

    constructor(props: Props) {
        super(props)
        this.inputRef = createRef<HTMLInputElement>()
    }

    _getFilesSize = (files: File[]) => {
        return files.reduce((sum, file) => sum + (file.size || 0), 0)
    }

    handleOnChange = (event: {
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
                if (this.props.returnFiles && this.props.onChange) {
                    return this.props.onChange(files as unknown as string[])
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
                if (this.props.onChange) {
                    this.props.onChange(result)
                }
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

    handleRemove = () => {
        const inputEl = this.inputRef.current
        if (inputEl) inputEl.value = ''
        if (this.props.onChange) {
            this.props.onChange('')
        }
    }

    _handleButtonClick = () => {
        this.inputRef.current?.click()
    }

    _getField = () => {
        const {noPreview, isRemovable, placeholder, className, value} =
            this.props

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
                    intent={ButtonIntent.Secondary}
                    isDisabled={disabled}
                    onClick={this._handleButtonClick}
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
                </Button>
                {isRemovable && previewUrl && (
                    <IconButton
                        className="ml-2"
                        intent={ButtonIntent.Destructive}
                        onClick={this.handleRemove}
                        aria-label="Remove the file"
                    >
                        close
                    </IconButton>
                )}
                <Input
                    id={this.id}
                    innerRef={this.inputRef}
                    onChange={this.handleOnChange as any}
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
                        'isRemovable',
                        'maxSize',
                        'value',
                    ])}
                />
            </div>
        )
    }
}

const connector = connect(null, {notify})

export default connector(FileFieldContainer)
