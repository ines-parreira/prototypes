import React from 'react'
import classNames from 'classnames'
import {ImageUpload} from '../../ImageUpload'
import {FileUpload} from '../../../hooks/useFileUpload'
import css from './CategoryImageEdit.less'

type Props = {
    imageFile: FileUpload
    currentImageUrl: string
    onRemoveImage: () => void
    onImageChanged: () => void
}

const getImageUploadHighlightText = (
    upload: FileUpload,
    currentImage?: string | null
) => {
    return (upload.isTouched && upload.payload) ||
        (!upload.isTouched && currentImage)
        ? 'Replace image'
        : 'Upload image'
}

export const CategoryImageEdit = ({
    imageFile,
    currentImageUrl,
    onRemoveImage,
    onImageChanged,
}: Props) => {
    const onRemoveImageClick = () => {
        imageFile.discardFile()
        onRemoveImage()
    }

    const isImageUploaded = imageFile.payload || currentImageUrl !== ''

    const onChangeFile = (file: File | undefined) => {
        imageFile.changeFile(file)
        onImageChanged()
    }

    return (
        <ImageUpload
            id="category-image"
            title="Image"
            imageRole="categoryImage"
            file={imageFile.payload}
            defaultPreview={currentImageUrl}
            onChangeFile={onChangeFile}
            isTouched={imageFile.isTouched}
            helpTextProps={{
                highlight: getImageUploadHighlightText(
                    imageFile,
                    currentImageUrl
                ),
                onRemoveClick: isImageUploaded ? onRemoveImageClick : undefined,
                text: !isImageUploaded
                    ? ' - Recommended file size: 318 x 160px (4:2 aspect ratio), 500KB or less.  Max file size: 10MB.'
                    : '',
                className: classNames(css.imageUpload, {
                    [css.imageUploadInline]: !isImageUploaded,
                }),
            }}
        />
    )
}
