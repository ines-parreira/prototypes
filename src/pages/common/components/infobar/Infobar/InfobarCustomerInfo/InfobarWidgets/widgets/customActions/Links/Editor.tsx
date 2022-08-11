import React, {
    FormEvent,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import {Form, Popover, PopoverBody} from 'reactstrap'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import useAppSelector from 'hooks/useAppSelector'
import {ensureHTTPS} from 'utils/url'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import Button from 'pages/common/components/button/Button'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'
import {
    Link,
    SubmitLink,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

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

    const currentAccount = useAppSelector(getCurrentAccountState)
    const {integrationId} = useContext(IntegrationContext)

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
        setPopoverOpen((state) => {
            if (!state && typeof index !== 'number') {
                logEvent(SegmentEvent.CustomActionLinksStart, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                })
            }
            return !state
        })
    }, [index, currentAccount, integrationId, setPopoverOpen])

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

    const handleBlur = useCallback(() => {
        setRedirectionLinkUrl((currentUrl) => ensureHTTPS(currentUrl))
    }, [])

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
                    <DEPRECATED_InputField
                        type="text"
                        name="redirectionLink.title"
                        label="Title"
                        defaultValue={redirectionLinkTitle}
                        onChange={(value) => setRedirectionLinkTitle(value)}
                    />
                    <DEPRECATED_InputField
                        type="text"
                        name="redirectionLink.url"
                        value={redirectionLinkUrl}
                        label="Link"
                        onChange={(value) => setRedirectionLinkUrl(value)}
                        onBlur={handleBlur}
                    />
                    <div>
                        <Button
                            type="submit"
                            className="mr-2"
                            isDisabled={!canSubmit}
                        >
                            Save
                        </Button>
                        <Button
                            intent="secondary"
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
