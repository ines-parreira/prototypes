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
} from '../../../../common/components/ImageUpload'

import css from './ImageUpload.less'

export type ImageUploadProps = {
    className?: string
    defaultPreview?: string
    HelpText?: HelpTextProps
    file?: File
    id: string
    isFluid?: boolean
    isTouched?: boolean
    info: string
    title: string
    style?: CSSProperties
    onChangeFile: (file: File | undefined) => void
}

export const ImageUpload: FunctionComponent<ImageUploadProps> = ({
    className,
    defaultPreview,
    file,
    info,
    isFluid,
    isTouched = false,
    id,
    title,
    style,
    onChangeFile,
    ...props
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
            <DropText />
        </div>
    )

    if (!isTouched && defaultPreview) {
        content = (
            <>
                <div className={css.close} onClickCapture={handleOnRemoveFile}>
                    <span className="material-icons-outlined">close</span>
                </div>
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
                <div className={css.close} onClickCapture={handleOnRemoveFile}>
                    <span className="material-icons-outlined">close</span>
                </div>
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
                accept="image/jpeg,image/png"
                inputRef={inputRef}
                style={isFluid ? {width: '100%'} : {}}
                onDrop={handleOnDropFile}
                onChange={handleOnChangeFile}
            >
                {content}
            </DropZone>
            {props.HelpText && (
                <HelpText
                    {...props.HelpText}
                    onHighlightClick={() => inputRef.current?.click()}
                />
            )}
        </div>
    )
}
