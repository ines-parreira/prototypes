import React, {
    MouseEvent as ReactMouseEvent,
    ChangeEvent,
    CSSProperties,
    FunctionComponent,
    useState,
    useEffect,
    createRef,
} from 'react'
import classNames from 'classnames'

import {
    Title,
    DropZone,
    DropText,
    HelpText,
    HelpTextProps,
    DropZoneProps,
} from '../../../../common/components/ImageUpload'

import css from './ImageUpload.less'

export type ImageUploadProps = Pick<DropZoneProps, 'id' | 'accept' | 'size'> & {
    className?: string
    defaultPreview?: string
    helpTextProps?: HelpTextProps
    file?: File
    isFluid?: boolean
    isTouched?: boolean
    info?: string
    title: string
    style?: CSSProperties
    onChangeFile: (file: File | undefined) => void
}

export const ImageUpload: FunctionComponent<ImageUploadProps> = ({
    className,
    defaultPreview,
    file,
    info,
    size,
    isFluid,
    isTouched = false,
    id,
    title,
    style,
    onChangeFile,
    helpTextProps,
    accept = 'image/jpeg,image/png',
}: ImageUploadProps) => {
    const inputRef = createRef<HTMLInputElement>()
    const [localImage, setLocalImage] = useState<File>()

    const handleOnDropFile = (event: DragEvent) => {
        if (event?.dataTransfer) {
            const file = Array.from(event.dataTransfer?.files)[0]
            if (file) {
                setLocalImage(file)
                onChangeFile(file)
            }
        }
    }

    const handleOnChangeFile = (
        event: ChangeEvent<HTMLInputElement>,
        ref: HTMLInputElement | null
    ) => {
        if (event?.target?.files) {
            const file = Array.from(event.target.files)[0]
            if (file) {
                setLocalImage(file)
                onChangeFile(file)

                // ?    Reset the inner input value to be able to
                // ? upload the same file if the current change is cleared
                if (ref) {
                    ref.value = ''
                }
            }
        }
    }

    const handleOnRemoveFile = (event: ReactMouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        setLocalImage(undefined)
        onChangeFile(undefined)
    }

    useEffect(() => {
        if (file) {
            setLocalImage(file)
        }
    }, [file])

    useEffect(() => {
        if (!isTouched && localImage) {
            setLocalImage(undefined)
        }
    }, [isTouched, localImage])

    let content = (
        <div className={css.content}>
            <DropText size={size} />
        </div>
    )

    if (!isTouched && defaultPreview) {
        content = (
            <>
                <span className={css.close} onClickCapture={handleOnRemoveFile}>
                    <i className="material-icons-outlined">close</i>
                </span>
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
                <span className={css.close} onClickCapture={handleOnRemoveFile}>
                    <i className="material-icons-outlined">close</i>
                </span>
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
        <div className={classNames(css.container, className)} style={style}>
            <Title help={info} Tooltip={{style: {width: 180}}}>
                {title}
            </Title>
            <DropZone
                id={id}
                accept={accept}
                inputRef={inputRef}
                size={size}
                style={isFluid ? {width: '100%'} : {}}
                onDrop={handleOnDropFile}
                onChange={handleOnChangeFile}
                className={classNames(css['drop-zone'], {
                    [css['drop-zone-small']]: size === 'small',
                })}
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
