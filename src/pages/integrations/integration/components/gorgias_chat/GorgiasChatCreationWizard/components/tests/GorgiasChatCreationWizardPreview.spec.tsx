import React from 'react'
import {Provider} from 'react-redux'
import {fireEvent, render} from '@testing-library/react'
import {Map, fromJS} from 'immutable'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {widgetTexts} from 'config/integrations/widget'

import {
    GORGIAS_CHAT_LIVE_CHAT_ALWAYS_LIVE_DURING_BUSINESS_HOURS,
    GORGIAS_CHAT_LIVE_CHAT_OFFLINE,
} from 'config/integrations/gorgias_chat'

import GorgiasChatCreationWizardPreview from '../GorgiasChatCreationWizardPreview'

const mockStore = configureMockStore([thunk])

const introductionText = 'Online Introduction Text'
const offlineIntroductionText = 'Offline Introduction Text'

const integration: Map<any, any> = fromJS({
    id: 1,
    name: 'Test Integration',
    meta: {
        language: 'en-US',
    },
    decoration: {
        introduction_text: introductionText,
        offline_introduction_text: offlineIntroductionText,
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

        expect(firstChild).toHaveTextContent(introductionText)

        fireEvent.click(radioButtons[1])

        expect(firstChild).toHaveTextContent(offlineIntroductionText)
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

        expect(onlineFirstChild).toHaveTextContent(introductionText)

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

        expect(offlineFirstChild).toHaveTextContent(offlineIntroductionText)
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

        expect(firstChild).toHaveTextContent(offlineIntroductionText)
        expect(firstChild).toHaveTextContent(testChatTitle)
        expect(firstChild).toHaveTextContent(
            widgetTexts['fr-FR'].inputPlaceholder
        )
    })
})
