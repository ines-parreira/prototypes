import type { FormEvent } from 'react'
import React, { useCallback, useContext, useEffect, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { ensureHTTPS } from '@repo/utils'
import { Popover, PopoverBody } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useAppNode } from 'appNode'
import useAppSelector from 'hooks/useAppSelector'
import type {
    Link,
    SubmitLink,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import InputField from 'pages/common/forms/input/InputField'
import { AppContext } from 'providers/infobar/AppContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './Links.less'

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
    const { integrationId } = useContext(IntegrationContext)
    const { appId } = useContext(AppContext)

    const [canSubmit, setCanSubmit] = useState(
        checkCanSubmit(link.url, link.label),
    )
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [redirectionLinkTitle, setRedirectionLinkTitle] = useState(link.label)
    const [redirectionLinkUrl, setRedirectionLinkUrl] = useState(link.url)
    const appNode = useAppNode()

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
                    app_id: appId,
                })
            }
            return !state
        })
    }, [index, currentAccount, integrationId, appId, setPopoverOpen])

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
        [index, onSubmit, isEditing, redirectionLinkTitle, redirectionLinkUrl],
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
            container={appNode ?? undefined}
        >
            <PopoverBody>
                <form onSubmit={handleSubmit}>
                    <InputField
                        className={css.inputSpacing}
                        name="redirectionLink.title"
                        label="Title"
                        defaultValue={redirectionLinkTitle}
                        onChange={(value) => setRedirectionLinkTitle(value)}
                    />
                    <InputField
                        className={css.inputSpacing}
                        name="redirectionLink.url"
                        value={redirectionLinkUrl}
                        label="Link"
                        onChange={(value) => setRedirectionLinkUrl(value)}
                        onBlur={handleBlur}
                    />
                    <div>
                        <Button
                            type="submit"
                            isDisabled={!canSubmit}
                            className={css.buttonSpacing}
                        >
                            Save
                        </Button>
                        <Button intent="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </PopoverBody>
        </Popover>
    )
}
