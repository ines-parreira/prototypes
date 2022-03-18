import React, {FunctionComponent, createRef} from 'react'

import {
    Title,
    DropZone,
    DropText,
    HelpText,
    HelpTextProps,
    DropZoneProps,
} from '../../../../common/components/ImageUpload'

import {useLocalImage} from './hooks'

import css from './ImageUpload.less'

export type ImageUploadProps = Pick<
    DropZoneProps,
    'id' | 'accept' | 'imageRole'
> & {
    defaultPreview?: string
    helpTextProps?: HelpTextProps
    file?: File
    isTouched?: boolean
    info?: string
    title: string
    onChangeFile: (file: File | undefined) => void
}

export const ImageUpload: FunctionComponent<ImageUploadProps> = ({
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
}: ImageUploadProps) => {
    const inputRef = createRef<HTMLInputElement>()

    const {
        handleOnChangeFile,
        handleOnDropFile,
        handleOnRemoveFile,
        localImage,
    } = useLocalImage({file, onChangeFile, isTouched})

    const closeSpan = (
        <span className={css.close} onClickCapture={handleOnRemoveFile}>
            <i className="material-icons-outlined">close</i>
        </span>
    )

    let content = (
        <div className={css.content}>
            <DropText imageRole={imageRole} />
        </div>
    )

    if (!isTouched && defaultPreview) {
        content = (
            <>
                {closeSpan}
                <div className={css.content}>
                    <img
                        className={css.preview}
                        alt={defaultPreview}
                        src={defaultPreview}
                    />
                </div>
            </>
        )
    }

    if (localImage) {
        content = (
            <>
                {closeSpan}
                <div className={css.content}>
                    <img
                        className={css.preview}
                        alt={localImage.name}
                        src={URL.createObjectURL(localImage)}
                    />
                </div>
            </>
        )
    }

    return (
        <div className={css.container}>
            <Title help={info} Tooltip={{style: {width: 180}}}>
                {title}
            </Title>
            <DropZone
                id={id}
                accept={accept}
                inputRef={inputRef}
                imageRole={imageRole}
                onDrop={handleOnDropFile}
                onChange={handleOnChangeFile}
                className={css.dropZone}
            >
                {content}
            </DropZone>
            {helpTextProps && (
                <HelpText
                    {...helpTextProps}
                    onHighlightClick={() => inputRef.current?.click()}
                />
            )}
        </div>
    )
}
