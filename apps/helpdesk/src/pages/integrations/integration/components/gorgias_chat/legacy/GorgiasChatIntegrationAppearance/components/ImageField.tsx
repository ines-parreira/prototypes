import type React from 'react'
import { useCallback, useRef, useState } from 'react'

import classnames from 'classnames'

import { UploadType } from 'common/types'
import useAppSelector from 'hooks/useAppSelector'
import type { FileFieldContainer } from 'pages/common/forms/FileField'
import FileField from 'pages/common/forms/FileField'
import { getCurrentIntegration } from 'state/integrations/selectors'

import css from './ImageField.less'

export enum ImageFieldVariant {
    Avatar = 'avatar',
    Header = 'header',
}

type UploadLinkProps = {
    isUploading: boolean
    onClick: () => void
    hasValue: boolean
    showSeparator: boolean
    variant?: ImageFieldVariant
}

const UploadLink = ({
    isUploading,
    onClick,
    hasValue,
    showSeparator,
    variant,
}: UploadLinkProps) => (
    <div className={css.uploadLinkContainer}>
        <a
            href="#"
            onClick={(ev) => {
                ev.preventDefault()
                onClick()
            }}
            className={css.uploadLink}
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
            {variant === ImageFieldVariant.Avatar && (
                <span>Recommended size 100 x 100 px. Max 500 KB.</span>
            )}
            {variant === ImageFieldVariant.Header && (
                <span>
                    Works best with horizontal logos with transparent
                    background. Max 500 KB.
                </span>
            )}
        </span>
    </div>
)

type PreviewVariantProps = {
    children?: React.ReactNode
    close?: React.ReactNode
    isDisabled?: boolean
    onSelect: () => void
}

const PreviewAvatarLogo = ({
    children,
    close,
    isDisabled,
    onSelect,
}: PreviewVariantProps) => (
    <div
        className={classnames(css.previewAvatarLogoContent, css.previewSpacing)}
    >
        <div
            className={classnames(css.imagePreview, css.imagePreviewAvatar, {
                [css.imagePreviewDisabled]: isDisabled,
            })}
            onClick={onSelect}
        >
            {children}
        </div>
        {close}
    </div>
)

const PreviewHeaderLogo = ({
    children,
    close,
    isDisabled,
    onSelect,
}: PreviewVariantProps) => (
    <div
        className={classnames(
            css.previewHeaderLogoContainer,
            css.previewSpacing,
        )}
    >
        <div className={css.previewHeaderLogoContent}>
            <div
                className={classnames(
                    css.imagePreview,
                    css.imagePreviewHeader,
                    {
                        [css.imagePreviewDisabled]: isDisabled,
                    },
                )}
                onClick={onSelect}
            >
                {children}
            </div>
            {close}
        </div>
    </div>
)

type PreviewProps = {
    isDisabled?: boolean
    isDiscardable?: boolean
    onDiscard: () => void
    onSelect: () => void
    url?: string | null
    variant?: ImageFieldVariant
}

const Preview = ({
    isDisabled,
    isDiscardable,
    onDiscard,
    onSelect,
    url,
    variant,
}: PreviewProps) => {
    const isAvatarLogo = variant === ImageFieldVariant.Avatar

    const children = (
        <>
            {url ? (
                <img src={url} alt="Uploaded" />
            ) : (
                <i className="material-icons">image</i>
            )}
        </>
    )

    const close = isDiscardable && url && (
        <div
            className={isAvatarLogo ? css.closeAvatar : css.closeHeader}
            onClick={onDiscard}
        >
            <i className="material-icons">close</i>
        </div>
    )

    if (isAvatarLogo) {
        return (
            <PreviewAvatarLogo
                close={close}
                isDisabled={isDisabled}
                onSelect={onSelect}
            >
                {children}
            </PreviewAvatarLogo>
        )
    }

    return (
        <PreviewHeaderLogo
            close={close}
            isDisabled={isDisabled}
            onSelect={onSelect}
        >
            {children}
        </PreviewHeaderLogo>
    )
}

type ImageFieldProps = {
    onChange: (url?: string) => void
    isRequired?: boolean
    isDiscardable?: boolean
    shouldSeparateImageInfo?: boolean
    maxSize: number
    url?: string | null
    variant?: ImageFieldVariant
}

const ImageField = ({
    url,
    onChange,
    isRequired,
    isDiscardable,
    shouldSeparateImageInfo = true,
    maxSize,
    variant = ImageFieldVariant.Avatar,
}: ImageFieldProps) => {
    const fileField = useRef<FileFieldContainer>(null)
    const [isUploading, setIsUploading] = useState(false)
    const integration = useAppSelector(getCurrentIntegration)

    const onDiscard = useCallback(() => fileField.current?.handleRemove(), [])
    const onSelect = useCallback(
        () => fileField.current?.handleButtonClick(),
        [],
    )

    return (
        <>
            <Preview
                isDisabled={isUploading}
                isDiscardable={isDiscardable}
                onDiscard={onDiscard}
                onSelect={onSelect}
                url={url}
                variant={variant}
            />
            <UploadLink
                isUploading={isUploading}
                onClick={onSelect}
                hasValue={!!url}
                showSeparator={shouldSeparateImageInfo}
                variant={variant}
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
