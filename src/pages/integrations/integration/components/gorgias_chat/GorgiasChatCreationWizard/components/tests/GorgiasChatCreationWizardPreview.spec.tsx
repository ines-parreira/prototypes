import {fireEvent, render} from '@testing-library/react'
import {Map, fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    GORGIAS_CHAT_WIDGET_TEXTS,
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'

import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'

const mockStore = configureMockStore([thunk])

const language = 'en-US'

const integration: Map<any, any> = fromJS({
    id: 1,
    name: 'Test Integration',
    meta: {
        language,
    },
})

const minProps: React.ComponentProps<typeof GorgiasChatCreationWizardPreview> =
    {
        integration,
    }

describe('<GorgiasChatCreationWizardPreview />', () => {
    it('renders different preview based on status toggle value', () => {
        const {
            getAllByRole,
            container: {firstChild},
        } = render(
            <Provider store={mockStore({})}>
                <GorgiasChatCreationWizardPreview {...minProps} />
            </Provider>
        )

        const radioButtons = getAllByRole('radio')

        fireEvent.click(radioButtons[0])

        expect(firstChild).toHaveTextContent(
            'Hi, could you give me an update on my order status?'
        )

        fireEvent.click(radioButtons[1])

        expect(firstChild).toHaveTextContent(
            GORGIAS_CHAT_WIDGET_TEXTS['en-US']?.contactFormIntro
        )
    })

    it('renders different preview based on live chat availability', () => {
        const {
            container: {firstChild: onlineFirstChild},
        } = render(
            <Provider store={mockStore({})}>
                <GorgiasChatCreationWizardPreview
                    integration={integration.setIn(
                        ['meta', 'preferences', 'live_chat_availability'],
                        GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS
                    )}
                />
            </Provider>
        )

        expect(onlineFirstChild).toHaveTextContent(
            'Hi, could you give me an update on my order status?'
        )

        const {
            container: {firstChild: offlineFirstChild},
        } = render(
            <Provider store={mockStore({})}>
                <GorgiasChatCreationWizardPreview
                    integration={integration.setIn(
                        ['meta', 'preferences', 'live_chat_availability'],
                        GORGIAS_CHAT_LIVE_CHAT_OFFLINE
                    )}
                />
            </Provider>
        )

        expect(offlineFirstChild).toHaveTextContent(
            GORGIAS_CHAT_WIDGET_TEXTS['en-US']?.contactFormIntro
        )
    })

    it('props override integration values', () => {
        const testChatTitle = 'Test Chat Title'

        const {
            container: {firstChild},
        } = render(
            <Provider store={mockStore({})}>
                <GorgiasChatCreationWizardPreview
                    {...minProps}
                    isOnline={false}
                    name={testChatTitle}
                    language="fr-FR"
                />
            </Provider>
        )

        expect(firstChild).toHaveTextContent(
            GORGIAS_CHAT_WIDGET_TEXTS['fr-FR']?.contactFormIntro
        )
        expect(firstChild).toHaveTextContent(testChatTitle)
    })
})
