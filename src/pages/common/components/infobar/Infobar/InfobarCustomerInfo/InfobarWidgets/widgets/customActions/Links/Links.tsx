import React, {useState, useMemo, memo, useCallback, useEffect} from 'react'
import {Button, Collapse, ListGroup} from 'reactstrap'
import {List, Map} from 'immutable'
import {connect} from 'react-redux'

import expandUp from '../../../../../../../../../../../img/infobar/expand-up-blue.svg'
import expandDown from '../../../../../../../../../../../img/infobar/expand-down.svg'
import {
    updateEditedWidget,
    startWidgetEdition,
    removeEditedWidget,
} from '../../../../../../../../../../state/widgets/actions'
import {Link as LinkType, SubmitLink} from '../types'

import Editor from './Editor'
import Link from './Link'
import css from './Links.less'

const MAX_VISIBLE_LINKS = 3

type Props = {
    templatePath: string
    templateAbsolutePath: string
    source: Map<string, unknown>
    immutableLinks: List<Map<string, unknown>>
    isEditing?: boolean
    startWidgetEdition: typeof startWidgetEdition
    updateEditedWidget: typeof updateEditedWidget
    removeEditedWidget: typeof removeEditedWidget
}

export function Links(props: Props) {
    const {
        templatePath,
        templateAbsolutePath,
        source,
        immutableLinks,
        isEditing = false,
        startWidgetEdition,
        updateEditedWidget,
        removeEditedWidget,
    } = props

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
                startWidgetEdition(`${templatePath}.meta.custom`)
                updateEditedWidget({
                    links: links,
                })
            }
        },
        [
            links,
            removeEditedWidget,
            startWidgetEdition,
            templateAbsolutePath,
            templatePath,
            updateEditedWidget,
        ]
    )

    const handleSubmit = useCallback<SubmitLink>(
        (link, index) => {
            startWidgetEdition(`${templatePath}.meta.custom`)

            if (typeof index === 'number') {
                links[index] = link
            } else {
                links.push(link)
            }

            updateEditedWidget({
                links: links,
            })
        },
        [links, startWidgetEdition, templatePath, updateEditedWidget]
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
                    <ListGroup flush>
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
                            color="link"
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
                        className={css.addButton}
                        id={targetId}
                    >
                        <i className="material-icons mr-2">add</i>
                        Add Redirection Link
                    </Button>
                    <Editor target={targetId} onSubmit={handleSubmit} />
                </>
            )}
        </>
    )
}

const connector = connect(null, {
    updateEditedWidget,
    startWidgetEdition,
    removeEditedWidget,
})

export default connector(memo(Links))
