import { fromJS } from 'immutable'
import { keyBy } from 'lodash'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { applicationsAutomationSettingsAiAgentEnabledFixture } from 'pages/aiAgent/fixtures/applicationAutomationSettings.fixture'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { initialState as articlesState } from 'state/entities/helpCenter/articles'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories'

export const getAiAgentStoreFixture = () => {
    const MOCK_EMAIL_ADDRESS = 'test@mail.com'

    const MOCK_EMAIL_INTEGRATION = {
        id: 1,
        type: IntegrationType.Email,
        name: 'My email integration',
        meta: {
            address: MOCK_EMAIL_ADDRESS,
        },
    }

    const defaultState = {
        currentAccount: fromJS(account),
        integrations: fromJS({
            integrations: [MOCK_EMAIL_INTEGRATION],
        }),
        billing: fromJS(billingState),
    }
    const contactForm = ContactFormFixture

    return {
        ...defaultState,
        entities: {
            contactForm: {
                contactFormsAutomationSettings: {
                    automationSettingsByContactFormId: {
                        [contactForm.id]: {
                            workflows: [],
                            order_management: { enabled: false },
                        },
                    },
                },
                contactForms: {
                    contactFormById: keyBy([contactForm], 'id'),
                },
            },
            chatsApplicationAutomationSettings:
                applicationsAutomationSettingsAiAgentEnabledFixture,
            helpCenter: {
                helpCenters: {
                    helpCentersById: {
                        '1': getSingleHelpCenterResponseFixture,
                    },
                },
                helpCentersAutomationSettings: {},
                articles: articlesState,
                categories: categoriesState,
            },
        },
    }
}
