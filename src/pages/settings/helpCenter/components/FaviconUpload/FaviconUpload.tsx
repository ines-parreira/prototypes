import React, {
    MouseEvent as ReactMouseEvent,
    ChangeEvent,
    CSSProperties,
    FunctionComponent,
    useState,
    useEffect,
} from 'react'
import classNames from 'classnames'

import {
    Title,
    DropZone,
    UploadButton,
    HelpText,
} from '../../../../common/components/ImageUpload'

import css from './FaviconUpload.less'

export type FaviconUpload = {
    className?: string
    defaultPreview?: string
    file?: File
    id: string
    isTouched?: boolean
    style?: CSSProperties
    onChangeFile: (file: File | undefined) => void
}

export const FaviconUpload: FunctionComponent<FaviconUpload> = ({
    className,
    defaultPreview,
    file,
    id,
    isTouched = false,
    style,
    onChangeFile,
}: FaviconUpload) => {
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

    let content = <div className={css.content} />

    const handleOnRemoveFile = (event: ReactMouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        setLocalImage(undefined)
        onChangeFile(undefined)
    }

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
            <Title
                help="This is shown in each browser beside your website’s name."
                Tooltip={{style: {width: 180}}}
            >
                Favicon
            </Title>
            <div className={css.input}>
                <DropZone
                    accept="image/png,image/jpeg,image/x-icon"
                    id={id}
                    className="mr-4"
                    size="small"
                    onDrop={handleOnDropFile}
                    onChange={handleOnChangeFile}
                >
                    {content}
                </DropZone>
                <UploadButton
                    name="faviconUpload"
                    onChange={handleOnChangeFile}
                />
            </div>
            <HelpText text="Ideally a 64px square PNG" />
        </div>
    )
}
