import React, {
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {Collapse, ListGroup} from 'reactstrap'
import {List, Map} from 'immutable'
import {connect, ConnectedProps, useSelector} from 'react-redux'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import expandUp from 'assets/img/infobar/expand-up-blue.svg'
import expandDown from 'assets/img/infobar/expand-down.svg'

import {
    removeEditedWidget,
    startWidgetEdition,
    updateCustomActions,
} from 'state/widgets/actions'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'
import {
    Link as LinkType,
    SubmitLink,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import Editor from './Editor'
import Link from './Link'
import css from './Links.less'

const MAX_VISIBLE_LINKS = 3

type Props = {
    templatePath: string
    templateAbsolutePath: string[]
    source: Map<string, unknown>
    immutableLinks: List<Map<string, unknown>>
    isEditing?: boolean
}

export function Links(props: Props & ConnectedProps<typeof connector>) {
    const {
        templatePath,
        templateAbsolutePath,
        source,
        immutableLinks,
        isEditing = false,
        startWidgetEdition,
        updateCustomActions,
        removeEditedWidget,
    } = props

    const currentAccount = useSelector(getCurrentAccountState)
    const {integrationId} = useContext(IntegrationContext)

    const [links, setLinks] = useState<LinkType[]>([])

    useEffect(() => {
        setLinks(immutableLinks.toJS())
    }, [immutableLinks])

    const [collapseOpen, setCollapseOpen] = useState(false)
    const handleToggle = useCallback(() => {
        setCollapseOpen((collapseOpen) => !collapseOpen)
    }, [])

    const handleRemove = useCallback(
        (index: number) => {
            removeEditedWidget(
                `${templatePath}.meta.custom.links`,
                templateAbsolutePath
            )

            links.splice(index, 1)

            if (links.length > 0) {
                startWidgetEdition(`${templatePath}.meta.custom.links`)
                updateCustomActions(links)
            }

            logEvent(SegmentEvent.CustomActionLinksDeleted, {
                account_domain: currentAccount.get('domain'),
                integration_id: integrationId,
            })
        },
        [
            links,
            removeEditedWidget,
            startWidgetEdition,
            templateAbsolutePath,
            templatePath,
            updateCustomActions,
            currentAccount,
            integrationId,
        ]
    )

    const handleSubmit = useCallback<SubmitLink>(
        (link, index) => {
            startWidgetEdition(`${templatePath}.meta.custom.links`)

            if (typeof index === 'number') {
                links[index] = link
                logEvent(SegmentEvent.CustomActionLinksEdited, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                })
            } else {
                links.push(link)
                logEvent(SegmentEvent.CustomActionLinksAdded, {
                    account_domain: currentAccount.get('domain'),
                    integration_id: integrationId,
                })
            }

            updateCustomActions(links)
        },
        [
            links,
            startWidgetEdition,
            templatePath,
            updateCustomActions,
            currentAccount,
            integrationId,
        ]
    )

    const targetId = `custom-action-link-${templatePath.replace(/\./g, '')}`

    const allLinks = links.map((link, index) => (
        <Link
            key={index}
            index={index}
            link={link}
            source={source}
            targetId={`${targetId}-${index}`}
            isEditing={isEditing}
            onRemove={handleRemove}
            onSubmit={handleSubmit}
        />
    ))

    const isCollapsible = useMemo(
        // We don’t want the collapse button to be displayed
        // only to hide 1 link, hence the + 1
        () => !isEditing && links.length > MAX_VISIBLE_LINKS + 1,
        [isEditing, links]
    )

    return (
        <>
            {allLinks.length > 0 && (
                <>
                    <ListGroup flush className={css.listGroup}>
                        {isEditing || !isCollapsible ? (
                            allLinks
                        ) : (
                            <>
                                {allLinks.slice(0, MAX_VISIBLE_LINKS)}
                                <Collapse isOpen={collapseOpen}>
                                    {allLinks.slice(
                                        MAX_VISIBLE_LINKS,
                                        allLinks.length
                                    )}
                                </Collapse>
                            </>
                        )}
                    </ListGroup>
                    {isCollapsible && (
                        <Button
                            type="button"
                            intent={ButtonIntent.Secondary}
                            className={css.collapseButton}
                            onClick={handleToggle}
                        >
                            {collapseOpen ? (
                                <>
                                    <img
                                        src={expandUp}
                                        alt="Contract"
                                        className={css.collapseIcon}
                                    />
                                    SHOW LESS
                                </>
                            ) : (
                                <>
                                    <img
                                        src={expandDown}
                                        alt="Expand"
                                        className={css.collapseIcon}
                                    />
                                    SHOW MORE
                                </>
                            )}
                        </Button>
                    )}
                </>
            )}
            {isEditing && (
                <>
                    <Button
                        type="button"
                        id={targetId}
                        className={css.addButton}
                        intent={ButtonIntent.Secondary}
                    >
                        <ButtonIconLabel icon="add" />
                        Add Redirection Link
                    </Button>
                    <Editor target={targetId} onSubmit={handleSubmit} />
                </>
            )}
        </>
    )
}

const connector = connect(null, {
    updateCustomActions,
    startWidgetEdition,
    removeEditedWidget,
})

export default connector(memo(Links))
