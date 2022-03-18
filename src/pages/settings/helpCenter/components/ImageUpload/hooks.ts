import {
    MouseEvent as ReactMouseEvent,
    ChangeEvent,
    useState,
    useEffect,
} from 'react'

export const useLocalImage = ({
    file,
    isTouched,
    onChangeFile,
}: {
    file?: File
    isTouched?: boolean
    onChangeFile: (files?: File) => void
}) => {
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

    return {
        handleOnChangeFile,
        handleOnDropFile,
        handleOnRemoveFile,
        localImage,
    }
}
