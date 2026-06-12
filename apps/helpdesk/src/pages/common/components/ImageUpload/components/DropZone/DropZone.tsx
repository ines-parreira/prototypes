import type {
    ChangeEvent,
    FunctionComponent,
    ReactChild,
    RefObject,
} from 'react'
import React, { createRef, useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import _toArray from 'lodash/toArray'

import { LegacyButton as Button } from '@gorgias/axiom'

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
    imageRole?:
        | 'default'
        | 'logo'
        | 'favicon'
        | 'bannerImage'
        | 'categoryImage'
        | 'wizardLogo'
    onDragIn?: (event: DragEvent) => void
    onDragOut?: (event: DragEvent) => void
    onDrop?: (event: DragEvent) => void
    onChange?: (
        event: ChangeEvent<HTMLInputElement>,
        ref: HTMLInputElement | null,
    ) => void
}

export const DropZone: FunctionComponent<DropZoneProps> = ({
    id,
    accept,
    children,
    className,
    inputRef = createRef<HTMLInputElement>(),
    name,
    imageRole = 'default',
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
                          accept?.includes(item.type),
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
        [accept, onDragIn],
    )

    const handleDragOut = useCallback(
        (event: DragEvent) => {
            event.preventDefault()
            event.stopPropagation()

            setDragging(false)
            setIsDragRejected(false)
            onDragOut && onDragOut(event)
        },
        [onDragOut],
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
                          accept?.includes(item.type),
                      )
                    : true

                if (dragIsAccepted) {
                    onDrop && onDrop(event)
                }
            }
        },
        [accept, onDrop],
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
                className={css.wrapper}
                ref={dropZone}
                htmlFor={id}
                aria-label="Drop zone files"
            >
                <div
                    className={classNames(
                        {
                            [css.container]: true,
                            [css.default]: imageRole === 'default',
                            [css.favicon]: imageRole === 'favicon',
                            [css.logo]: imageRole === 'logo',
                            [css.bannerImage]: imageRole === 'bannerImage',
                            [css.categoryImage]: imageRole === 'categoryImage',
                            [css.wizardLogo]: imageRole === 'wizardLogo',
                            [css.rejected]: isDragRejected,
                            [css.accepted]: isDragging && !isDragRejected,
                        },
                        className,
                    )}
                >
                    <div className={css.content}>{children}</div>
                </div>
                {imageRole === 'favicon' && (
                    <Button
                        intent="secondary"
                        className={css.uploadButton}
                        onClick={() => {
                            inputRef.current?.click()
                        }}
                    >
                        <i className="material-icons">attachment</i>Upload
                    </Button>
                )}
            </label>
            <input
                ref={inputRef}
                accept={accept}
                type="file"
                id={id}
                aria-label="Drop zone files input"
                name={name}
                style={{ display: 'none' }}
                onChange={(...args) => {
                    if (onChange) {
                        onChange(...args, inputRef.current)
                    }
                }}
            />
        </>
    )
}
