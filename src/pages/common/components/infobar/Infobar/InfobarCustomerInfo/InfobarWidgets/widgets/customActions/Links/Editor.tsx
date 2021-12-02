import React, {FormEvent, useCallback, useState, useEffect} from 'react'
import {Button, Form, Popover, PopoverBody} from 'reactstrap'

import InputField from '../../../../../../../../forms/InputField'
import {Link, SubmitLink} from '../types'

type Props = {
    target: string
    link?: Link
    isEditing?: boolean
    index?: number
    onSubmit: SubmitLink
}

const checkCanSubmit = (linkLabel = '', linkUrl = '') => {
    const trimmedLinkTitle = linkLabel.trim()
    const trimmedLinkUrl = linkUrl.trim()

    return !!(trimmedLinkTitle?.length && trimmedLinkUrl?.length)
}

const defaultLink = {
    url: '',
    label: '',
}

export default function Editor(props: Props) {
    const {
        target,
        isEditing = false,
        link = defaultLink,
        onSubmit,
        index,
    } = props

    const [canSubmit, setCanSubmit] = useState(
        checkCanSubmit(link.url, link.label)
    )
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [redirectionLinkTitle, setRedirectionLinkTitle] = useState(link.label)
    const [redirectionLinkUrl, setRedirectionLinkUrl] = useState(link.url)

    useEffect(() => {
        setCanSubmit(checkCanSubmit(redirectionLinkTitle, redirectionLinkUrl))
    }, [redirectionLinkTitle, redirectionLinkUrl])

    useEffect(() => {
        setRedirectionLinkTitle(link.label)
        setRedirectionLinkUrl(link.url)
    }, [link])

    const togglePopover = useCallback(() => {
        setPopoverOpen((state) => !state)
    }, [setPopoverOpen])

    const handleSubmit = useCallback(
        (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()
            const newLink = {
                label: redirectionLinkTitle,
                url: redirectionLinkUrl,
            }

            onSubmit(newLink, index)

            if (!isEditing) {
                setRedirectionLinkTitle('')
                setRedirectionLinkUrl('')
            }
            setPopoverOpen((state) => !state)
        },
        [index, onSubmit, isEditing, redirectionLinkTitle, redirectionLinkUrl]
    )

    const handleCancel = useCallback(() => {
        setRedirectionLinkTitle(link.label)
        setRedirectionLinkUrl(link.url)
        setPopoverOpen((state) => !state)
    }, [link.label, link.url])

    return (
        <Popover
            placement={isEditing ? 'top' : 'bottom'}
            isOpen={popoverOpen}
            target={target}
            toggle={togglePopover}
            trigger="legacy"
        >
            <PopoverBody>
                <Form onSubmit={handleSubmit}>
                    <InputField
                        type="text"
                        name="redirectionLink.title"
                        label="Title"
                        defaultValue={redirectionLinkTitle}
                        onChange={(value) => setRedirectionLinkTitle(value)}
                    />
                    <InputField
                        type="text"
                        name="redirectionLink.url"
                        defaultValue={redirectionLinkUrl}
                        label="Link"
                        onChange={(value) => setRedirectionLinkUrl(value)}
                    />
                    <div>
                        <Button
                            color="primary"
                            type="submit"
                            className="mr-2"
                            disabled={!canSubmit}
                        >
                            Save
                        </Button>
                        <Button
                            color="secondary"
                            type="button"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form>
            </PopoverBody>
        </Popover>
    )
}
