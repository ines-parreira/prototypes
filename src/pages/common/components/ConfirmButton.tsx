import React, {MouseEvent, useMemo, useRef, useState} from 'react'
import classnames from 'classnames'
import {Button, Popover, PopoverHeader, PopoverBody} from 'reactstrap'
import _get from 'lodash/get'
import _noop from 'lodash/noop'
import {Placement} from 'popper.js'
import {useMountedState} from 'react-use'

import type {ReactNode} from 'react'

import css from './ConfirmButton.less'

type Props = {
    buttonClassName?: string
    children?: ReactNode
    className?: string
    color?: string
    confirm: () => void | Promise<any>
    confirmColor?: string
    containerElement?: HTMLElement
    content?: ReactNode
    disabled?: boolean
    id?: string
    loading?: boolean
    placement?: Placement
    title?: string
    type?: 'button' | 'submit'
    skip?: boolean
}

const ConfirmButton = ({
    buttonClassName,
    className = '',
    children = null,
    confirm = _noop,
    confirmColor = 'success',
    containerElement,
    content = null,
    disabled = false,
    id = '',
    loading = false,
    placement = 'bottom',
    skip = false,
    title = 'Are you sure?',
    type = 'button',
    ...buttonProps
}: Props) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isLoadingInternal, setIsLoadingInternal] = useState(false)
    const [isConfirmationDisplayed, setIsConfirmationDisplayed] = useState(
        false
    )
    const isMounted = useMountedState()
    const dateId = useMemo(() => Date.now().toString(), [])
    const uid = useMemo(() => `confirm-button-${id || dateId}`, [id, dateId])
    const container = useMemo(() => {
        if (type === 'submit' && ref.current) {
            // keep submit popovers in form
            return containerElement || ref.current.closest('form') || 'body'
        }

        return 'body'
    }, [containerElement, ref.current, type])

    const showConfirmation = (e: MouseEvent) => {
        if (type === 'submit') {
            const form: HTMLFormElement = _get(e, ['target', 'form'])
            if (!!form && !form.checkValidity()) {
                // don't show popover for invalid forms
                return
            }
        }

        e.preventDefault()
        setIsConfirmationDisplayed(true)
    }

    const hideConfirmation = () => {
        setIsConfirmationDisplayed(false)
    }

    const hideLoading = () => {
        if (!isMounted) {
            return
        }

        setIsLoadingInternal(false)
    }

    const confirmAction = () => {
        setIsLoadingInternal(true)

        // HACK if the popover hides immediately onClick
        // the submit event is not triggered.
        setTimeout(hideConfirmation)

        Promise.resolve(confirm()).then(hideLoading).catch(hideLoading)
    }

    const isLoading = isLoadingInternal || loading

    return (
        <div
            className={classnames(css.component, 'd-inline-block', className)}
            id={id}
            ref={ref}
        >
            <Button
                id={uid}
                type={type}
                disabled={isLoading || disabled}
                onClick={skip ? confirm : showConfirmation}
                className={classnames(buttonClassName, {
                    [`${css.loading} btn-loading`]: isLoading,
                })}
                {...buttonProps}
            >
                {children}
            </Button>
            <Popover
                placement={placement}
                isOpen={isConfirmationDisplayed}
                target={uid}
                toggle={hideConfirmation}
                container={container}
                trigger="legacy"
            >
                <PopoverHeader>{title}</PopoverHeader>
                <PopoverBody>
                    <p>{content}</p>

                    <Button
                        type={type}
                        color={confirmColor}
                        onClick={confirmAction}
                    >
                        Confirm
                    </Button>
                </PopoverBody>
            </Popover>
        </div>
    )
}

export default ConfirmButton
