import React from 'react'

import {Card, CardBody} from 'reactstrap'

import classnames from 'classnames'

import {fromJS} from 'immutable'

import Avatar from '../../../components/Avatar/Avatar'
import {Actor, Meta, Source} from '../../../../../models/ticket/types'
import {default as TicketMessageMeta} from '../../../../tickets/detail/components/TicketMessages/Meta.js'
import {DatetimeLabel} from '../../../utils/labels.js'
import facebookIcon from '../../../../../../img/integrations/facebook-feed-round-icon.svg'
import instagramIcon from '../../../../../../img/integrations/instagram-icon-grey.svg'

import css from './CommentCard.less'

type Props = {
    integrationId: number
    messageId?: string
    commentMessage: string
    source: Source
    sender: Actor
    meta?: Meta
    messageCreatedDatetime: string
    isFacebookComment: boolean
}

export default function CommentCard({
    integrationId,
    messageId,
    commentMessage,
    source,
    sender,
    meta,
    messageCreatedDatetime,
    isFacebookComment,
}: Props) {
    const senderMeta = sender?.meta ? fromJS(sender?.meta) : fromJS({})
    const icon = isFacebookComment ? facebookIcon : instagramIcon

    return (
        <Card className={css.commentCard}>
            <CardBody>
                <div className="row">
                    <div className={classnames('col-1', css.avatarContainer)}>
                        <Avatar
                            email={sender?.email}
                            name={sender?.name}
                            url={senderMeta.get('profile_picture_url')} // eslint-disable-line
                            size={36}
                        />
                    </div>
                    <div className="col-11">
                        <div
                            className={classnames(
                                'row',
                                css.flexContainerRow,
                                css.metaInfo
                            )}
                        >
                            <span className={css.customerNameBody}>
                                {sender?.firstname} {sender?.lastname}
                            </span>
                            <img
                                src={icon}
                                className={
                                    isFacebookComment
                                        ? css.facebookIcon
                                        : css.instagramIcon
                                }
                                alt="social media icon"
                            />
                            <TicketMessageMeta
                                messageId={messageId}
                                meta={meta}
                                source={source}
                                integrationId={integrationId}
                                via={''}
                            />
                            <div className={classnames(css.right, css.wrapper)}>
                                <DatetimeLabel
                                    dateTime={messageCreatedDatetime}
                                />
                            </div>
                        </div>
                        <div
                            className={classnames(
                                'row',
                                css.flexContainerColumn,
                                css.comment
                            )}
                        >
                            {commentMessage}
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}
