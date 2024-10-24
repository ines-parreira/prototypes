import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {TicketMessageSourceType} from 'business/types/ticket'
import {FacebookReactionType} from 'constants/integrations/facebook'
import {
    duplicatedHiddenFacebookMessage,
    facebookMessageNoMeta,
    facebookMessageWithCustomerReaction,
    facebookMessageWithPageAndCustomerReactions,
    facebookMessageWithPageReaction,
    hiddenFacebookMessage,
} from 'models/ticket/tests/mocks'

import {SourceActionsFooter} from '../SourceActionsFooter'

describe('<SourceActionsFooter/>', () => {
    const minProps: ComponentProps<typeof SourceActionsFooter> = {
        isMessageHidden: false,
        isMessageDeleted: false,
        meta: null,
        executeAction: jest.fn(),
    }

    it.each([
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        "should only render a `Like` action because it's a Facebook message with no meta",
        (source_type) => {
            const facebookMessage = {
                ...facebookMessageNoMeta,
            }
            facebookMessage.source!.type = source_type
            const {container} = render(
                <SourceActionsFooter
                    {...minProps}
                    source={facebookMessage.source}
                    meta={facebookMessage.meta}
                    integrationId={facebookMessage.integration_id}
                    messageId={facebookMessage.message_id}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        "should render a `Unlike` action because it's a Facebook message with already a page reaction",
        (source_type) => {
            const facebookMessage = {
                ...facebookMessageWithPageReaction,
            }
            facebookMessage.source!.type = source_type
            const {container} = render(
                <SourceActionsFooter
                    {...minProps}
                    source={facebookMessage.source}
                    meta={facebookMessage.meta}
                    integrationId={facebookMessage.integration_id}
                    messageId={facebookMessage.message_id}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        "should render the customer's reaction and a `Like` action because the message has a customer reaction and no page reaction",
        (source_type) => {
            const facebookMessage = {
                ...facebookMessageWithCustomerReaction,
            }
            facebookMessage.source!.type = source_type
            const {container} = render(
                <SourceActionsFooter
                    {...minProps}
                    source={facebookMessage.source}
                    meta={facebookMessage.meta}
                    integrationId={facebookMessage.integration_id}
                    messageId={facebookMessage.message_id}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        'should render page, customer and other reactions because we have all three types of reactions',
        (source_type) => {
            const facebookMessage = {
                ...facebookMessageWithPageAndCustomerReactions,
            }
            facebookMessage.source!.type = source_type
            const {container} = render(
                <SourceActionsFooter
                    {...minProps}
                    source={facebookMessage.source}
                    meta={facebookMessage.meta}
                    integrationId={facebookMessage.integration_id}
                    messageId={facebookMessage.message_id}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        'should not render any reactions because the message is hidden',
        (source_type) => {
            const facebookMessage = {
                ...hiddenFacebookMessage,
            }
            facebookMessage.source!.type = source_type
            const {container} = render(
                <SourceActionsFooter
                    {...minProps}
                    source={facebookMessage.source}
                    meta={facebookMessage.meta}
                    integrationId={facebookMessage.integration_id}
                    messageId={facebookMessage.message_id}
                    isMessageHidden={true}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        'should not render any reactions because the message is deleted',
        (source_type) => {
            const facebookMessage = {
                ...hiddenFacebookMessage,
            }
            facebookMessage.source!.type = source_type
            const {container} = render(
                <SourceActionsFooter
                    {...minProps}
                    source={facebookMessage.source}
                    meta={facebookMessage.meta}
                    integrationId={facebookMessage.integration_id}
                    messageId={facebookMessage.message_id}
                    isMessageDeleted={true}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        'should render text reactions because the reactions types have no corresponding icons',
        (source_type) => {
            const facebookMessage = {
                ...facebookMessageWithPageAndCustomerReactions,
            }
            facebookMessage.source!.type = source_type
            facebookMessage.meta!.facebook_reactions!.page_reaction!.reaction_type =
                'UnknownReaction' as FacebookReactionType
            facebookMessage.meta!.facebook_reactions!.customer_reaction!.reaction_type =
                'UnknownReaction' as FacebookReactionType
            const {container} = render(
                <SourceActionsFooter
                    {...minProps}
                    source={facebookMessage.source}
                    meta={facebookMessage.meta}
                    integrationId={facebookMessage.integration_id}
                    messageId={facebookMessage.message_id}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it.each([
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
    ])(
        "should render nothing because it's a duplicated Facebook message",
        (source_type) => {
            const facebookMessage = {
                ...duplicatedHiddenFacebookMessage,
            }
            facebookMessage.source!.type = source_type
            const {container} = render(
                <SourceActionsFooter
                    {...minProps}
                    source={facebookMessage.source}
                    meta={facebookMessage.meta}
                    integrationId={facebookMessage.integration_id}
                    messageId={facebookMessage.message_id}
                    isMessageHidden={true}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it("should not render actions because it's an unfetchable mention comment", () => {
        const facebookMessage = {...facebookMessageWithPageAndCustomerReactions}
        facebookMessage.source!.type =
            TicketMessageSourceType.FacebookMentionComment
        facebookMessage.source!.extra = {unfetchable: true}
        const {container} = render(
            <SourceActionsFooter
                {...minProps}
                source={facebookMessage.source}
                meta={facebookMessage.meta}
                integrationId={facebookMessage.integration_id}
                messageId={facebookMessage.message_id}
                isMessageHidden={true}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
