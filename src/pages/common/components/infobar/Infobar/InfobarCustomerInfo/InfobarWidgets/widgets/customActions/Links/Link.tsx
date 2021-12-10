import React, {useCallback, useMemo} from 'react'
import {ListGroupItem} from 'reactstrap'
import {Map} from 'immutable'
import {useSelector} from 'react-redux'

import {renderTemplate} from '../../../../../../../../utils/template'
import {getTicket} from '../../../../../../../../../../state/ticket/selectors'
import {getActiveCustomer} from '../../../../../../../../../../state/customers/selectors'
import {Link as LinkType, RemoveLink, SubmitLink} from '../types'

import css from './Links.less'
import Editor from './Editor'

type Props = {
    index: number
    targetId: string
    link: LinkType
    source: Map<string, any>
    isEditing?: boolean
    onRemove: RemoveLink
    onSubmit: SubmitLink
}

export function Link(props: Props) {
    const {
        source,
        index,
        targetId,
        link,
        isEditing = false,
        onRemove,
        onSubmit,
    } = props

    const {url: linkUrl, label: linkLabel} = link

    const ticket = useSelector(getTicket)
    const user = useSelector(getActiveCustomer)

    const templateContext = useMemo(() => {
        return {
            ...(source.toJS() as Record<string, unknown>),
            ticket,
            user,
        }
    }, [user, source, ticket])

    const renderLinkUrl = useCallback(() => {
        return renderTemplate(linkUrl, templateContext)
    }, [linkUrl, templateContext])

    return (
        <ListGroupItem className={css.groupItem}>
            <a
                href={renderLinkUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={css.link}
            >
                {renderTemplate(linkLabel, templateContext)}
                <i className={`${css.linkIcon} material-icons`}>open_in_new</i>
            </a>
            {isEditing && (
                <span className={css.editIcons}>
                    <i
                        className="material-icons text-faded clickable"
                        id={targetId}
                    >
                        settings
                    </i>
                    <i
                        className="material-icons text-danger clickable"
                        onClick={() => onRemove(index)}
                    >
                        close
                    </i>
                    <Editor
                        target={targetId}
                        link={link}
                        index={index}
                        isEditing
                        onSubmit={onSubmit}
                    />
                </span>
            )}
        </ListGroupItem>
    )
}

export default Link
