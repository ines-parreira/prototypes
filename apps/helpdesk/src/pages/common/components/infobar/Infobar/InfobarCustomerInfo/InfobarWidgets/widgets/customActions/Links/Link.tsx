import React, { useCallback, useContext } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import useAppSelector from 'hooks/useAppSelector'
import { Source } from 'models/widget/types'
import { applyCustomActionTemplate } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/helpers/templating'
import { useTemplateContext } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/hooks/useTemplateContext'
import {
    Link as LinkType,
    RemoveLink,
    SubmitLink,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import { AppContext } from 'providers/infobar/AppContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import Editor from './Editor'

import css from './Links.less'

type Props = {
    index: number
    targetId: string
    link: LinkType
    source: Source
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
    const { url: linkUrl, label: linkLabel } = link

    const { integrationId } = useContext(IntegrationContext)
    const { appId } = useContext(AppContext)

    const currentAccount = useAppSelector(getCurrentAccountState)

    const templateContext = useTemplateContext(source)

    const renderLinkUrl = useCallback(() => {
        return applyCustomActionTemplate(linkUrl, templateContext)
    }, [linkUrl, templateContext])

    const handleClick = useCallback(() => {
        logEvent(SegmentEvent.CustomActionLinksClicked, {
            account_domain: currentAccount.get('domain'),
            integration_id: integrationId,
            app_id: appId,
        })
    }, [currentAccount, integrationId, appId])

    return (
        <li className={css.linkRow}>
            <a
                href={renderLinkUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={css.link}
                onClick={handleClick}
            >
                {applyCustomActionTemplate(linkLabel, templateContext)}
                <i className={`${css.linkIcon} material-icons`}>open_in_new</i>
            </a>
            {isEditing && (
                <span className={css.editIcons}>
                    <i className="material-icons" id={targetId}>
                        edit
                    </i>
                    <i
                        className="material-icons text-danger"
                        onClick={() => onRemove(index)}
                    >
                        delete
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
        </li>
    )
}

export default Link
