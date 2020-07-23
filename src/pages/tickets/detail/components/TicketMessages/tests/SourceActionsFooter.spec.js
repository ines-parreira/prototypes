import React from 'react'
import {render} from 'enzyme'

import configureMockStore from 'redux-mock-store'

import {
    facebookMessageWithPageReaction,
    facebookMessageWithCustomerReaction,
    facebookMessageNoMeta,
    facebookMessageWithPageAndCustomerReactions,
    hiddenFacebookMessage,
} from '../../../../../../models/ticket/tests/mocks'

import SourceActionsFooter from '../SourceActionsFooter'
import * as infobarActions from '../../../../../../state/infobar/actions'

describe('<SourceActionsFooter/>', () => {
    const mockStore = configureMockStore()
    const store = mockStore({
        executeAction: infobarActions.executeAction,
    })

    it("should only render a `Like` action because it's a Facebook message with no meta", () => {
        const component = render(
            <SourceActionsFooter
                source={facebookMessageNoMeta.source}
                meta={facebookMessageNoMeta.meta}
                integrationId={facebookMessageNoMeta.integration_id}
                messageId={facebookMessageNoMeta.message_id}
                isMessageHidden={false}
                store={store}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it("should render a `Unlike` action because it's a Facebook message with already a page reaction", () => {
        const component = render(
            <SourceActionsFooter
                source={facebookMessageWithPageReaction.source}
                meta={facebookMessageWithPageReaction.meta}
                integrationId={facebookMessageWithPageReaction.integration_id}
                messageId={facebookMessageWithPageReaction.message_id}
                isMessageHidden={false}
                store={store}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it("should render the customer's reaction and a `Like` action because the message has a customer reaction and no page reaction", () => {
        const component = render(
            <SourceActionsFooter
                source={facebookMessageWithCustomerReaction.source}
                meta={facebookMessageWithCustomerReaction.meta}
                integrationId={
                    facebookMessageWithCustomerReaction.integration_id
                }
                messageId={facebookMessageWithCustomerReaction.message_id}
                isMessageHidden={false}
                store={store}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render all page, customer and other reactions because', () => {
        const component = render(
            <SourceActionsFooter
                source={facebookMessageWithPageAndCustomerReactions.source}
                meta={facebookMessageWithPageAndCustomerReactions.meta}
                integrationId={
                    facebookMessageWithPageAndCustomerReactions.integration_id
                }
                messageId={
                    facebookMessageWithPageAndCustomerReactions.message_id
                }
                isMessageHidden={false}
                store={store}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should not render any reactions because the message is hidden', () => {
        const component = render(
            <SourceActionsFooter
                source={hiddenFacebookMessage.source}
                meta={hiddenFacebookMessage.meta}
                integrationId={hiddenFacebookMessage.integration_id}
                messageId={hiddenFacebookMessage.message_id}
                isMessageHidden={true}
                store={store}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render text reactions because the reactions types have no corresponding icons', () => {
        facebookMessageWithPageAndCustomerReactions.meta.facebook_reactions.page_reaction.reaction_type =
            'UnknownReaction'
        facebookMessageWithPageAndCustomerReactions.meta.facebook_reactions.customer_reaction.reaction_type =
            'UnknownReaction'

        const component = render(
            <SourceActionsFooter
                source={facebookMessageWithPageAndCustomerReactions.source}
                meta={facebookMessageWithPageAndCustomerReactions.meta}
                integrationId={
                    facebookMessageWithPageAndCustomerReactions.integration_id
                }
                messageId={
                    facebookMessageWithPageAndCustomerReactions.message_id
                }
                isMessageHidden={false}
                store={store}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render a spinner loader because the page has reacted and is waiting for webhook update', () => {
        facebookMessageWithPageAndCustomerReactions.meta.facebook_reactions.page_reaction.is_reacting = true

        const component = render(
            <SourceActionsFooter
                source={facebookMessageWithPageAndCustomerReactions.source}
                meta={facebookMessageWithPageAndCustomerReactions.meta}
                integrationId={
                    facebookMessageWithPageAndCustomerReactions.integration_id
                }
                messageId={
                    facebookMessageWithPageAndCustomerReactions.message_id
                }
                isMessageHidden={false}
                store={store}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
