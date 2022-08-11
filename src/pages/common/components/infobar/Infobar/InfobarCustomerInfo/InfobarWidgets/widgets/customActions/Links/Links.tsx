import React, {
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {Collapse} from 'reactstrap'
import {List, Map} from 'immutable'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    removeEditedWidget,
    startWidgetEdition,
    updateCustomActions,
} from 'state/widgets/actions'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
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

export function Links(props: Props) {
    const {
        templatePath,
        templateAbsolutePath,
        source,
        immutableLinks,
        isEditing = false,
    } = props

    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
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
            dispatch(
                removeEditedWidget(
                    `${templatePath}.meta.custom.links`,
                    templateAbsolutePath
                )
            )

            links.splice(index, 1)

            if (links.length > 0) {
                dispatch(
                    startWidgetEdition(`${templatePath}.meta.custom.links`)
                )
                dispatch(updateCustomActions(links))
            }

            logEvent(SegmentEvent.CustomActionLinksDeleted, {
                account_domain: currentAccount.get('domain'),
                integration_id: integrationId,
            })
        },
        [
            links,
            templateAbsolutePath,
            templatePath,
            currentAccount,
            integrationId,
            dispatch,
        ]
    )

    const handleSubmit = useCallback<SubmitLink>(
        (link, index) => {
            dispatch(startWidgetEdition(`${templatePath}.meta.custom.links`))

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

            dispatch(updateCustomActions(links))
        },
        [links, templatePath, currentAccount, integrationId, dispatch]
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
                    <ul className={css.linkList}>
                        {isEditing || !isCollapsible ? (
                            allLinks
                        ) : (
                            <>
                                {allLinks.slice(0, MAX_VISIBLE_LINKS)}
                                <Collapse
                                    isOpen={collapseOpen}
                                    className={css.collapseGroup}
                                >
                                    {allLinks.slice(
                                        MAX_VISIBLE_LINKS,
                                        allLinks.length
                                    )}
                                </Collapse>
                            </>
                        )}
                    </ul>
                    {isCollapsible && (
                        <Button
                            type="button"
                            intent="secondary"
                            size="small"
                            className={css.showMore}
                            onClick={handleToggle}
                        >
                            <ButtonIconLabel
                                icon={
                                    collapseOpen ? 'expand_less' : 'expand_more'
                                }
                            >
                                Show {collapseOpen ? 'less' : 'more'}
                            </ButtonIconLabel>
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
                        intent="secondary"
                        size="small"
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

export default memo(Links)
