import React, {useCallback} from 'react'
import {ListGroupItem} from 'reactstrap'
import {Map} from 'immutable'

import {renderTemplate} from '../../../../../../../../utils/template'
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

export default function Link(props: Props) {
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

    const renderLinkUrl = useCallback(() => {
        return renderTemplate(linkUrl, source.toJS())
    }, [linkUrl, source])

    return (
        <ListGroupItem className={css.groupItem}>
            <a
                href={renderLinkUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={css.link}
            >
                {renderTemplate(linkLabel, source.toJS())}
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
