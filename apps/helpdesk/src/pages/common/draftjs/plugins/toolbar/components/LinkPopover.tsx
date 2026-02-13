import type { MouseEvent } from 'react'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Popover } from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import IconButton from 'pages/common/components/button/IconButton'
import { ModalContext } from 'pages/common/components/modal/Modal'
import type { RootState } from 'state/types'

import css from './LinkPopover.less'

type Props = {
    children?: React.ReactNode
    url: string
    onDelete?: () => void
    onEdit?: () => void
}

export default function LinkPopover({
    children,
    url,
    onDelete,
    onEdit,
}: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isEditingLink = useAppSelector(
        (state: RootState) => state.ui.editor.isEditingLink,
    )

    useEffect(
        () => () => {
            if (timeout.current) {
                clearTimeout(timeout.current)
            }
        },
        [],
    )

    const handleMouseEnter = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
            if (timeout.current) {
                clearTimeout(timeout.current)
            }
            if (!isEditingLink) {
                setIsOpen(true)
            }
        },
        [isEditingLink],
    )

    const handleClick = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
            window.open(url, '_blank', 'noopener,noreferrer')
        },
        [url],
    )

    const handleMouseLeave = useCallback((e: MouseEvent) => {
        e.preventDefault()
        timeout.current = setTimeout(() => {
            setIsOpen(false)
        }, 250)
    }, [])

    const handleClickEdit = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
            if (onEdit) onEdit()
            setIsOpen(false)
        },
        [onEdit],
    )

    const handleClickDelete = useCallback(
        (e: MouseEvent) => {
            e.preventDefault()
            if (onDelete) onDelete()
        },
        [onDelete],
    )

    const linkRef = useRef<HTMLAnchorElement>(null)

    return (
        <a
            ref={linkRef}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={css.link}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <ModalContext.Consumer>
                {(context) => (
                    <>
                        {linkRef.current && (
                            <Popover
                                isOpen={isOpen}
                                target={linkRef}
                                placement="bottom-start"
                                className={css.wrapper}
                                innerClassName={css.inner}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                trigger="legacy"
                                container={context.ref}
                                data-react-aria-top-layer="true"
                            >
                                <a
                                    className={css.url}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {url}
                                </a>
                                {onEdit && (
                                    <IconButton
                                        size="small"
                                        intent="secondary"
                                        onClick={handleClickEdit}
                                        className={css.edit}
                                    >
                                        edit
                                    </IconButton>
                                )}
                                {onDelete && (
                                    <IconButton
                                        size="small"
                                        intent="secondary"
                                        className={css.delete}
                                        onClick={handleClickDelete}
                                    >
                                        clear
                                    </IconButton>
                                )}
                            </Popover>
                        )}
                    </>
                )}
            </ModalContext.Consumer>
        </a>
    )
}
