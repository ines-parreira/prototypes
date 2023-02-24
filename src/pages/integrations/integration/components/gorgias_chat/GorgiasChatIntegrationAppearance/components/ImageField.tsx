import React, {useCallback, useRef, useState} from 'react'
import classnames from 'classnames'

import FileField, {
    FileFieldContainer,
    UploadType,
} from 'pages/common/forms/FileField'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentIntegration} from 'state/integrations/selectors'

import css from './ImageField.less'

type UploadLinkProps = {
    isUploading: boolean
    onClick: () => void
    hasValue: boolean
    showSeparator: boolean
}

const UploadLink: React.FC<UploadLinkProps> = ({
    isUploading,
    onClick,
    hasValue,
    showSeparator,
}) => (
    <>
        <a
            href="#"
            onClick={(ev) => {
                ev.preventDefault()
                onClick()
            }}
            className="mb-3"
        >
            {isUploading ? (
                <span>
                    <i className="material-icons md-spin mr-2">refresh</i>
                    Uploading...
                </span>
            ) : (
                <b>{hasValue ? 'Replace' : 'Upload'} image</b>
            )}
        </a>
        <span className={css.imageInfo}>
            {showSeparator && <span className="ml-1"> – </span>}
            <span>Recommended size 100 x 100 px. Max 500 KB.</span>
        </span>
    </>
)

type PreviewProps = {
    isDisabled?: boolean
    isDiscardable?: boolean
    onDiscard: () => void
    onSelect: () => void
    url?: string
}

const Preview: React.FC<PreviewProps> = ({
    isDisabled,
    isDiscardable,
    onDiscard,
    onSelect,
    url,
}) => (
    <div className={css.imagePreviewWrapper}>
        <div
            className={classnames(
                css.imagePreview,
                {[css.imagePreviewDisabled]: isDisabled},
                'mb-3'
            )}
            onClick={onSelect}
        >
            {url && <img src={url} alt="Uploaded" />}
            <i className="material-icons">image</i>
        </div>
        {isDiscardable && url && (
            <div className={css.close} onClick={onDiscard}>
                <i className="material-icons">close</i>
            </div>
        )}
    </div>
)

type ImageFieldProps = {
    url?: string
    onChange: (url?: string) => void
    isRequired?: boolean
    isDiscardable?: boolean
    shouldSeparateImageInfo?: boolean
    maxSize: number
}

const ImageField: React.FC<ImageFieldProps> = ({
    url,
    onChange,
    isRequired,
    isDiscardable,
    shouldSeparateImageInfo = true,
    maxSize,
}) => {
    const fileField = useRef<FileFieldContainer>(null)
    const [isUploading, setIsUploading] = useState(false)
    const integration = useAppSelector(getCurrentIntegration)

    const onDiscard = useCallback(() => fileField.current?.handleRemove(), [])
    const onSelect = useCallback(
        () => fileField.current?.handleButtonClick(),
        []
    )

    return (
        <>
            <Preview
                isDisabled={isUploading}
                isDiscardable={isDiscardable}
                onDiscard={onDiscard}
                onSelect={onSelect}
                url={url}
            />
            <UploadLink
                isUploading={isUploading}
                onClick={onSelect}
                hasValue={!!url}
                showSeparator={shouldSeparateImageInfo}
            />
            <div className="d-none">
                <FileField
                    ref={fileField}
                    params={{
                        integration_id: integration.get('id'),
                    }}
                    isRemovable={false}
                    returnFiles={false}
                    noPreview={true}
                    onChange={onChange}
                    onUploadStatusChange={setIsUploading}
                    uploadType={UploadType.Avatar}
                    maxSize={maxSize}
                    required={isRequired}
                />
            </div>
        </>
    )
}

export default ImageField
