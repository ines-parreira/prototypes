import {shallow} from 'enzyme'

import React from 'react'

import {TicketMessageSourceType} from '../../../../../business/types/ticket'

import TicketMessageEmbeddedCard from '../TicketMessageEmbeddedCard'

const defaultProps: any = {
    integrationId: 1,
    messageId: '123',
    messageText: 'some comment',
    source: {
        type: TicketMessageSourceType.FacebookComment,
        from: {
            address: 'some_from_address',
            name: 'some_from_name',
        },
        to: [
            {
                address: 'some_from_address',
                name: 'some_from_name',
            },
        ],
    },
    sender: {
        id: 123,
        email: 'some_email@foo.com',
        name: 'some_sender_name',
        firstname: 'some_sender_firstname',
        lastname: 'some_sender_lastname',
    },
    messageCreatedDatetime: 'Sun Nov 01 2020 01:01:01 UTC+0000',
}

describe('<TicketMessageEmbeddedCard/>', () => {
    describe('render', () => {
        it.each([true, false])(
            'should render the comment card with different text positions',
            (textBelowAvatar) => {
                const localDefaultProps = {
                    ...defaultProps,
                    textBelowAvatar: textBelowAvatar,
                }
                const component = shallow(
                    <TicketMessageEmbeddedCard {...localDefaultProps} />
                ).dive()

                expect(component).toMatchSnapshot()
            }
        )

        it.each([true, false])(
            'should render the comment card with with or without messageCreatedDatetime',
            (hasMessageCreatedDatetime) => {
                const localDefaultProps = {
                    ...defaultProps,
                }

                if (!hasMessageCreatedDatetime) {
                    delete localDefaultProps.messageCreatedDatetime // eslint-disable-line
                }

                const component = shallow(
                    <TicketMessageEmbeddedCard
                        {...localDefaultProps}
                        textBelowAvatar={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            }
        )

        it.each([
            [
                {
                    content_type: 'foo_content',
                    name: 'foo_name',
                    size: 123,
                    url: 'foo_URL',
                    type: 'foo_type',
                },
            ],
            [],
            undefined,
        ])(
            'should render the comment card with with or without attachments',
            (attachments) => {
                const localDefaultProps = {
                    ...defaultProps,
                    attachments: attachments,
                }
                const component = shallow(
                    <TicketMessageEmbeddedCard
                        {...localDefaultProps}
                        textBelowAvatar={false}
                    />
                ).dive()

                expect(component).toMatchSnapshot()
            }
        )
    })
})
