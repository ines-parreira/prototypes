import React, {useCallback, useContext, useMemo} from 'react'
import {Map} from 'immutable'

import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {getTicket} from 'state/ticket/selectors'
import {getActiveCustomer} from 'state/customers/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUserState} from 'state/currentUser/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import useAppSelector from 'hooks/useAppSelector'
import {renderTemplate} from 'pages/common/utils/template'
import {
    Link as LinkType,
    RemoveLink,
    SubmitLink,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import css from './Links.less'
import Editor from './Editor'

const CURRENT_USER_TEMPLATE_FIELDS = [
    'name',
    'lastname',
    'firstname',
    'email',
] as const

type CurrentUserTemplateFields = typeof CURRENT_USER_TEMPLATE_FIELDS[number]

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

    const {integrationId} = useContext(IntegrationContext)

    const currentAccount = useAppSelector(getCurrentAccountState)
    const ticket = useAppSelector(getTicket)
    const user = useAppSelector(getActiveCustomer)
    const currentUser = useAppSelector(getCurrentUserState)

    const templateContext = useMemo(() => {
        const fullCurrentUserData = currentUser.toJS() as Record<
            string,
            unknown
        >
        const trimmedCurrentUserData: Partial<
            Record<CurrentUserTemplateFields, unknown>
        > = {}

        CURRENT_USER_TEMPLATE_FIELDS.forEach((field) => {
            trimmedCurrentUserData[field] = fullCurrentUserData[field]
        })

        return {
            ...(source.toJS() as Record<string, unknown>),
            ticket,
            user,
            current_user: trimmedCurrentUserData,
        }
    }, [user, source, ticket, currentUser])

    const renderLinkUrl = useCallback(() => {
        return renderTemplate(linkUrl, templateContext)
    }, [linkUrl, templateContext])

    const handleClick = useCallback(() => {
        logEvent(SegmentEvent.CustomActionLinksClicked, {
            account_domain: currentAccount.get('domain'),
            integration_id: integrationId,
        })
    }, [currentAccount, integrationId])

    return (
        <li className={css.linkRow}>
            <a
                href={renderLinkUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={css.link}
                onClick={handleClick}
            >
                {renderTemplate(linkLabel, templateContext)}
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
