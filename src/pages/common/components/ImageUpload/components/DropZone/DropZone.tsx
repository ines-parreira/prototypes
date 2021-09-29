import React, {
    FunctionComponent,
    ReactChild,
    createRef,
    useCallback,
    useEffect,
    useState,
    CSSProperties,
    ChangeEvent,
    RefObject,
} from 'react'
import _toArray from 'lodash/toArray'
import classNames from 'classnames'

import css from './DropZone.less'

export type DropZoneProps = {
    id: string
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
     * @description
     *      String that defines the file types the file input should accept.
     */
    accept?: string
    children?: ReactChild
    className?: string
    inputRef?: RefObject<HTMLInputElement>
    name?: string
    size?: 'default' | 'small'
    style?: CSSProperties
    onDragIn?: (event: DragEvent) => void
    onDragOut?: (event: DragEvent) => void
    onDrop?: (event: DragEvent) => void
    onChange?: (
        event: ChangeEvent<HTMLInputElement>,
        ref: HTMLInputElement | null
    ) => void
}

export const DropZone: FunctionComponent<DropZoneProps> = ({
    id,
    accept,
    children,
    className,
    inputRef = createRef<HTMLInputElement>(),
    name,
    size = 'default',
    style,
    onDragIn,
    onDragOut,
    onDrop,
    onChange,
}: DropZoneProps) => {
    const dropZone = createRef<HTMLLabelElement>()
    const [isDragging, setDragging] = useState(false)
    const [isDragRejected, setIsDragRejected] = useState(false)

    const handleDrag = (event: DragEvent) => {
        event.preventDefault()
        event.stopPropagation()
    }

    const handleDragIn = useCallback(
        (event: DragEvent) => {
            event.preventDefault()
            event.stopPropagation()

            if (event?.dataTransfer && event.dataTransfer.items.length > 0) {
                const dragIsAccepted = accept
                    ? _toArray(event.dataTransfer.items).every((item) =>
                          accept?.includes(item.type)
                      )
                    : true

                if (dragIsAccepted) {
                    setDragging(true)
                } else {
                    setIsDragRejected(true)
                }
            }

            onDragIn && onDragIn(event)
        },
        [accept, onDragIn]
    )

    const handleDragOut = useCallback(
        (event: DragEvent) => {
            event.preventDefault()
            event.stopPropagation()

            setDragging(false)
            setIsDragRejected(false)
            onDragOut && onDragOut(event)
        },
        [onDragOut]
    )

    const handleDrop = useCallback(
        (event: DragEvent) => {
            event.preventDefault()
            event.stopPropagation()

            setDragging(false)
            setIsDragRejected(false)

            if (event?.dataTransfer && event.dataTransfer.items.length > 0) {
                const dragIsAccepted = accept
                    ? _toArray(event.dataTransfer.items).every((item) =>
                          accept?.includes(item.type)
                      )
                    : true

                if (dragIsAccepted) {
                    onDrop && onDrop(event)
                }
            }
        },
        [accept, onDrop]
    )

    useEffect(() => {
        const element = dropZone.current
        if (element) {
            element.addEventListener('dragenter', handleDragIn)
            element.addEventListener('dragleave', handleDragOut)
            element.addEventListener('dragover', handleDrag)
            element.addEventListener('drop', handleDrop)
        }

        return () => {
            if (element) {
                element.removeEventListener('dragenter', handleDragIn)
                element.removeEventListener('dragleave', handleDragOut)
                element.removeEventListener('dragover', handleDrag)
                element.removeEventListener('drop', handleDrop)
            }
        }
    }, [dropZone, handleDragIn, handleDragOut, handleDrop])

    return (
        <>
            <label
                data-testid="dropZone"
                className={css.wrapper}
                ref={dropZone}
                htmlFor={id}
            >
                <div
                    className={classNames(
                        {
                            [css.container]: true,
                            [css.small]: size === 'small',
                            [css.rejected]: isDragRejected,
                            [css.accepted]: isDragging && !isDragRejected,
                        },
                        className
                    )}
                    style={style}
                >
                    <div className={css.content}>{children}</div>
                </div>
            </label>
            <input
                ref={inputRef}
                accept={accept}
                type="file"
                id={id}
                name={name}
                style={{display: 'none'}}
                onChange={(...args) => {
                    if (onChange) {
                        onChange(...args, inputRef.current)
                    }
                }}
            />
        </>
    )
}
