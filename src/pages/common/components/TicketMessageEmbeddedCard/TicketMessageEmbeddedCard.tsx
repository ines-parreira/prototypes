import React from 'react'

import {Col, Row} from 'reactstrap'

import classnames from 'classnames'

import {fromJS, List} from 'immutable'

import Avatar from '../../components/Avatar/Avatar'

import {Actor, Meta, Source} from '../../../../models/ticket/types'

import {default as TicketMessageMeta} from '../../../tickets/detail/components/TicketMessages/Meta'
import {DatetimeLabel} from '../../utils/labels'

import GenericCard from '../GenericCard/GenericCard'
import SourceIcon from '../SourceIcon'
import {Attachment} from '../../../../types'
import TicketAttachments from '../../../tickets/detail/components/ReplyArea/TicketAttachments'

import css from './TicketMessageEmbeddedCard.less'

type Props = {
    integrationId: number | null
    messageId?: string
    externalId?: string
    messageText: string
    source: Source
    sender: Actor
    meta?: Meta
    messageCreatedDatetime?: string
    textBelowAvatar?: boolean
    attachments?: List<Attachment>
}

export default function TicketMessageEmbeddedCard({
    integrationId,
    messageId,
    externalId,
    messageText,
    source,
    sender,
    meta,
    messageCreatedDatetime,
    textBelowAvatar,
    attachments,
}: Props) {
    const senderMeta = sender?.meta ? fromJS(sender?.meta) : fromJS({})
    const hasMessageCreatedDatetime = !!messageCreatedDatetime

    const avatarContent = (
        <Avatar
            email={sender?.email}
            name={sender?.name}
            url={senderMeta.get('profile_picture_url')} // eslint-disable-line
            size={36}
        />
    )

    const customerNameAndMetaContent = (
        <div className={css.verticalCenter}>
            <div className={css.customerNameBody}>
                {sender?.firstname} {sender?.lastname}
            </div>
            <div>
                <span className={classnames(css.source)}>
                    <SourceIcon type={source.type} className="uncolored" />
                </span>
            </div>
            <div>
                <TicketMessageMeta
                    messageId={messageId}
                    externalId={externalId}
                    meta={meta}
                    source={source}
                    integrationId={integrationId}
                    via={''}
                />
            </div>
        </div>
    )

    const dateTimeLabelContent = (
        <DatetimeLabel dateTime={messageCreatedDatetime} />
    )

    let cardContent = (
        <Row className="m-0">
            <Col md="1" className={css.avatarContainer}>
                {avatarContent}
            </Col>
            <Col md="11">
                {hasMessageCreatedDatetime && (
                    <Row>
                        <Col md="7">{customerNameAndMetaContent}</Col>
                        <Col
                            md="5"
                            className={classnames(
                                'text-right',
                                'justify-content-center',
                                'align-self-center',
                                css.dateTimeText,
                                'pr-0'
                            )}
                        >
                            {dateTimeLabelContent}
                        </Col>
                    </Row>
                )}
                {!hasMessageCreatedDatetime && (
                    <Row>
                        <Col md="12">{customerNameAndMetaContent}</Col>
                    </Row>
                )}
                <Row>
                    <Col md="12" className="pr-0 mt-2">
                        <span className={css.textBlock}>{messageText}</span>
                    </Col>
                </Row>
            </Col>
        </Row>
    )

    if (textBelowAvatar === true) {
        cardContent = (
            <>
                {hasMessageCreatedDatetime && (
                    <Row>
                        <Col md="7" className={css.verticalCenter}>
                            <div className="mr-2">{avatarContent}</div>
                            {customerNameAndMetaContent}
                        </Col>
                        <Col
                            md="5"
                            className={classnames(
                                'text-right',
                                'justify-content-center',
                                'align-self-center',
                                css.dateTimeText
                            )}
                        >
                            {dateTimeLabelContent}
                        </Col>
                    </Row>
                )}
                {!hasMessageCreatedDatetime && (
                    <Row>
                        <Col md="12" className={css.verticalCenter}>
                            <div className="mr-2">{avatarContent}</div>
                            {customerNameAndMetaContent}
                        </Col>
                    </Row>
                )}
                <Row className="mt-2">
                    <Col md="12">
                        <span className={css.textBlock}>{messageText}</span>
                    </Col>
                </Row>
            </>
        )
    }

    return (
        <GenericCard>
            {cardContent}
            {attachments && (
                <Row className="mt-2">
                    <Col md="12">
                        <TicketAttachments
                            attachments={fromJS(attachments || [])}
                        />
                    </Col>
                </Row>
            )}
        </GenericCard>
    )
}
