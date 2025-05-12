import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import _keyBy from 'lodash/keyBy'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/api-queries'

import { useListWorkflowEntryPoints } from 'models/workflows/queries'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS } from 'pages/settings/contactForm/constants'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import {
    automationSettingsFixture,
    selfServiceConfigurationFixture,
} from 'pages/settings/contactForm/fixtures/selfServiceConfiguration'
import { Components } from 'rest_api/help_center_api/client.generated'
import { getHasAutomate } from 'state/billing/selectors'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import ContactFormEntrypointPreview from '../ContactFormEntrypointPreview'

const CONTACT_FORM_SHOP_NAME = 'acme'

const queryClient = mockQueryClient()

const mockSelfServiceConfiguration = {
    isFetchPending: false,
    isUpdatePending: false,
    storeIntegration: undefined,
    selfServiceConfiguration: selfServiceConfigurationFixture,
    handleSelfServiceConfigurationUpdate: jest.fn(),
}

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () => ({
    __esModule: true,
    default: jest.fn(),
}))
jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
jest.mock('models/workflows/queries', () => ({
    useListWorkflowEntryPoints: jest.fn(),
}))
const mockedUseListWorkflowEntryPoints = jest.mocked(useListWorkflowEntryPoints)

const mockUseSelfServiceConfiguration = jest.mocked(useSelfServiceConfiguration)
const mockGetHasAutomate = jest.mocked(getHasAutomate)
const mockStore = configureMockStore([thunk])

type automationSettings = {
    order_management: {
        enabled: boolean
    }
    workflows: {
        id: string
        enabled: boolean
    }[]
}

const renderComponent = ({
    isFormHidden = true,
    contactForm = ContactFormFixture,
    automationSettings = automationSettingsFixture,
}: {
    isFormHidden?: boolean
    contactForm?: Components.Schemas.ContactFormDto
    automationSettings?: automationSettings
}) => {
    const mockedStore = mockStore({
        integrations: fromJS({
            integrations: [
                {
                    id: 1,
                    name: CONTACT_FORM_SHOP_NAME,
                    type: IntegrationType.Shopify,
                    meta: {
                        shop_name: CONTACT_FORM_SHOP_NAME,
                    },
                },
            ],
        }),
        entities: {
            contactForm: {
                contactFormsAutomationSettings: {
                    automationSettingsByContactFormId: {
                        [contactForm.id]: automationSettings,
                    },
                },
                contactForms: {
                    contactFormById: _keyBy([contactForm], 'id'),
                },
            },
            selfServiceConfigurations: selfServiceConfigurationFixture,
        },
    })

    render(
        <QueryClientProvider client={queryClient}>
            <Provider store={mockedStore}>
                <ContactFormEntrypointPreview
                    contactForm={contactForm}
                    isFormHidden={isFormHidden}
                />
            </Provider>
        </QueryClientProvider>,
    )
}

describe('<ContactFormEntrypointPreview />', () => {
    beforeEach(() => {
        mockUseSelfServiceConfiguration.mockReturnValue(
            mockSelfServiceConfiguration,
        )
        mockGetHasAutomate.mockReturnValue(true)
        mockedUseListWorkflowEntryPoints.mockReturnValue({
            isLoading: false,
            data: {},
        } as unknown as ReturnType<typeof useListWorkflowEntryPoints>)
    })
    it('should render component with form when Contact Form does not have shop integration', () => {
        renderComponent({})

        expect(screen.getByText('Write your message')).toBeInTheDocument()
    })
    it('should render component with form when Contact Form does not have AI Agent subscription', () => {
        mockGetHasAutomate.mockReturnValue(false)
        renderComponent({
            contactForm: {
                ...ContactFormFixture,
                shop_name: CONTACT_FORM_SHOP_NAME,
            },
        })

        expect(screen.getByText('Write your message')).toBeInTheDocument()
        expect(screen.queryByText('Report issue')).not.toBeInTheDocument()
    })
    it('should render component with Contact Us button', () => {
        renderComponent({
            contactForm: {
                ...ContactFormFixture,
                shop_name: CONTACT_FORM_SHOP_NAME,
            },
        })

        expect(screen.getByText('Contact Us')).toBeInTheDocument()
        expect(screen.getByText('Report issue')).toBeInTheDocument()
    })
    it('should render component with form displays immediately', () => {
        renderComponent({
            isFormHidden: false,
            contactForm: {
                ...ContactFormFixture,
                shop_name: CONTACT_FORM_SHOP_NAME,
            },
        })

        expect(screen.getByText('Report issue')).toBeInTheDocument()
        expect(screen.getByText('Write your message')).toBeInTheDocument()
    })
    it('should render component with form display immediately when order management and flows disabled', () => {
        renderComponent({
            contactForm: {
                ...ContactFormFixture,
                shop_name: CONTACT_FORM_SHOP_NAME,
            },
            automationSettings: CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS,
        })

        expect(screen.getByText('Write your message')).toBeInTheDocument()
        expect(screen.queryByText('Report issue')).not.toBeInTheDocument()
    })
})
