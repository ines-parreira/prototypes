import type { FunctionComponent, MouseEvent } from 'react'
import type React from 'react'
import { useEffect, useState } from 'react'

import {
    DropText,
    DropZone,
    HelpText,
    Title,
} from '../../../../common/components/ImageUpload'
import type { ImageUploadProps } from '../ImageUpload'
import { useLocalImage } from '../ImageUpload'
import { DraggablePreviewImage } from './components/DraggablePreviewImage/DraggablePreviewImage'

import imageUploadCss from '../ImageUpload/ImageUpload.less'
import css from './RepositionableImageUpload.less'

export type RepositionableImageUploadProps = ImageUploadProps & {
    verticalOffset?: number
    onSubmit: (offset: number) => void
    inputRef: React.RefObject<HTMLInputElement>
    isSavingBannerImage: boolean
}

export const RepositionableImageUpload: FunctionComponent<
    RepositionableImageUploadProps
> = ({
    defaultPreview,
    file,
    info,
    imageRole,
    isTouched = false,
    id,
    title,
    onChangeFile,
    helpTextProps,
    accept = 'image/jpeg,image/png',
    verticalOffset = 0,
    onSubmit,
    inputRef,
    isSavingBannerImage,
}: RepositionableImageUploadProps) => {
    const [repositioningInProgress, setRepositioningInProgress] =
        useState(false)
    const [showActionButtons, setShowActionButtons] = useState(false)

    const { handleOnChangeFile, handleOnDropFile, handleOnRemoveFile } =
        useLocalImage({ file, onChangeFile, isTouched })
    const [offset, setOffset] = useState(verticalOffset)

    useEffect(() => {
        if (isSavingBannerImage) {
            return
        }
        setOffset(verticalOffset)
    }, [verticalOffset, isSavingBannerImage])

    const content =
        !isSavingBannerImage && !isTouched && defaultPreview ? (
            <DraggablePreviewImage
                defaultPreview={defaultPreview}
                verticalOffset={verticalOffset}
                onSubmit={onSubmit}
                repositioningInProgress={repositioningInProgress}
                setRepositioningInProgress={setRepositioningInProgress}
                offset={offset}
                setOffset={setOffset}
                showActionButtons={showActionButtons}
                setShowActionButtons={setShowActionButtons}
            />
        ) : (
            <div className={imageUploadCss.content}>
                <DropText imageRole={imageRole} />
            </div>
        )

    const shouldDisplayRemoveImage = !isTouched && defaultPreview

    const handleRemoveImage = (event: MouseEvent<HTMLDivElement>) => {
        handleOnRemoveFile(event)
        setRepositioningInProgress(false)
    }

    return (
        <div className={imageUploadCss.container}>
            {title && (
                <Title help={info} Tooltip={{ style: { width: 180 } }}>
                    {title}
                </Title>
            )}
            {repositioningInProgress ? (
                <>{content}</>
            ) : (
                <DropZone
                    id={id}
                    accept={accept}
                    inputRef={inputRef}
                    imageRole={imageRole}
                    onDrop={handleOnDropFile}
                    onChange={handleOnChangeFile}
                    className={imageUploadCss.dropZone}
                >
                    {content}
                </DropZone>
            )}
            {helpTextProps && (
                <div className={css.helpText}>
                    <HelpText
                        {...helpTextProps}
                        onHighlightClick={() => inputRef.current?.click()}
                        onRemoveClick={
                            shouldDisplayRemoveImage
                                ? handleRemoveImage
                                : undefined
                        }
                    />
                </div>
            )}
        </div>
    )
}
