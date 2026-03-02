import type { RefObject } from 'react'
import { createRef } from 'react'

import type { AxiosError } from 'axios'
import classnames from 'classnames'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _isArray from 'lodash/isArray'
import _omit from 'lodash/omit'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import { Input } from 'reactstrap'
import type { InputType } from 'reactstrap/lib/Input'

import { LegacyButton as Button } from '@gorgias/axiom'

import type { UploadType } from 'common/types'
import { uploadFiles } from 'common/utils'
import IconButton from 'pages/common/components/button/IconButton'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { getFileTooLargeError } from 'utils/file'

import type { InputFieldProps } from './DEPRECATED_InputField'
import DEPRECATED_InputField from './DEPRECATED_InputField'

import css from './FileField.less'

const DEFAULT_ERROR = 'Failed to upload files. Please try again later.'

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
    onUploadStatusChange?: (isUploading: boolean) => void
} & ConnectedProps<typeof connector> &
    InputFieldProps<string | string[]>

type State = {
    isUploading: boolean
}

export class FileFieldContainer extends DEPRECATED_InputField<Props> {
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
        placeholder: 'Select a file',
        returnFiles: false, // return urls of files only by default
        isRemovable: false,
        type: 'file',
        maxSize: 0,
    }

    state: State = {
        isUploading: false,
    }

    declare id?: string

    inputRef: RefObject<HTMLInputElement>

    constructor(props: Props) {
        super(props)
        this.inputRef = createRef<HTMLInputElement>()
    }

    _getFilesSize = (files: File[]) => {
        return files.reduce((sum, file) => sum + (file.size || 0), 0)
    }

    _onUploadStatusChange = (isUploading: boolean) => {
        this.props.onUploadStatusChange &&
            this.props.onUploadStatusChange(isUploading)
        this.setState({ isUploading })
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

        this._onUploadStatusChange(true)

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
            this._onUploadStatusChange(false)
            return
        }

        uploadFiles(files, {
            type: this.props.uploadType,
            ...this.props.params,
        }).then(
            (files) => {
                this._onUploadStatusChange(false)

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
                this._onUploadStatusChange(false)
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
            },
        )
    }

    handleRemove = () => {
        const inputEl = this.inputRef.current
        if (inputEl) inputEl.value = ''
        if (this.props.onChange) {
            this.props.onChange('')
        }
    }

    handleButtonClick = () => {
        this.inputRef.current?.click()
    }

    _getField = () => {
        const { noPreview, isRemovable, placeholder, className, value } =
            this.props

        const { isUploading } = this.state

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
                    intent="secondary"
                    isDisabled={disabled}
                    onClick={this.handleButtonClick}
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
                        intent="destructive"
                        onClick={this.handleRemove}
                        aria-label="Remove the file"
                    >
                        close
                    </IconButton>
                )}
                <label htmlFor={this.props.id} className="d-none">
                    {this.props.id}
                </label>
                <Input
                    id={this.props.id}
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
                        'onUploadStatusChange',
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

const connector = connect(null, { notify }, null, { forwardRef: true })

export default connector(FileFieldContainer)
