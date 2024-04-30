import React from 'react'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {
    automationSettingsFixture,
    selfServiceConfigurationFixture,
    shopifyShopIntegrationFixture,
} from 'pages/settings/contactForm/fixtures/selfServiceConfiguration'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS} from 'pages/settings/contactForm/constants'
import ContactFormEntrypointPreview, {
    ContactFormWithShopIntegration,
} from '../ContactFormEntrypointPreview'

const mockSelfServiceConfiguration = {
    isFetchPending: false,
    isUpdatePending: false,
    storeIntegration: undefined,
    selfServiceConfiguration: selfServiceConfigurationFixture,
    handleSelfServiceConfigurationUpdate: jest.fn(),
}

const mockAutomationSettings = {
    isFetchPending: false,
    isUpdatePending: false,
    automationSettings: automationSettingsFixture,
    handleContactFormAutomationSettingsUpdate: jest.fn(),
    handleContactFormAutomationSettingsFetch: jest.fn(),
}

const mockEmptyAutomationSettings = {
    isFetchPending: false,
    isUpdatePending: false,
    automationSettings: CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS,
    handleContactFormAutomationSettingsUpdate: jest.fn(),
    handleContactFormAutomationSettingsFetch: jest.fn(),
}

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))
jest.mock('state/integrations/selectors', () => ({
    getIntegrationsByType: jest.fn(),
}))
jest.mock(
    'pages/automate/common/hooks/useContactFormAutomationSettings',
    () => ({
        __esModule: true,
        default: jest.fn(),
    })
)
jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () => ({
    __esModule: true,
    default: jest.fn(),
}))

const mockUseContactFormAutomationSettings = jest.mocked(
    useContactFormAutomationSettings
)
const mockUseSelfServiceConfiguration = jest.mocked(useSelfServiceConfiguration)
const mockStore = configureMockStore([thunk])()

const renderComponent = () => {
    render(
        <Provider store={mockStore}>
            <ContactFormEntrypointPreview
                contactForm={ContactFormFixture}
                isFormHidden={true}
            />
        </Provider>
    )
}

describe('<ContactFormEntrypointPreview />', () => {
    beforeEach(() => {
        mockUseSelfServiceConfiguration.mockReturnValue(
            mockSelfServiceConfiguration
        )
        mockUseContactFormAutomationSettings.mockReturnValue(
            mockAutomationSettings
        )
    })
    it('should render component with form when Contact Form does not have shop integration', () => {
        renderComponent()

        expect(screen.getByText('Write your message')).toBeInTheDocument()
    })
    it('should render component with Contact Us button', () => {
        render(
            <Provider store={mockStore}>
                <ContactFormWithShopIntegration
                    contactForm={ContactFormFixture}
                    isFormHidden={true}
                    shopIntegration={shopifyShopIntegrationFixture}
                />
            </Provider>
        )

        expect(screen.getByText('Contact Us')).toBeInTheDocument()
        expect(screen.getByText('Report issue')).toBeInTheDocument()
    })
    it('should render component with form displays immediately', () => {
        render(
            <Provider store={mockStore}>
                <ContactFormWithShopIntegration
                    contactForm={ContactFormFixture}
                    isFormHidden={false}
                    shopIntegration={shopifyShopIntegrationFixture}
                />
            </Provider>
        )

        expect(screen.getByText('Report issue')).toBeInTheDocument()
        expect(screen.getByText('Write your message')).toBeInTheDocument()
    })
    it('should render component with form display immediately when order management and flows disabled', () => {
        mockUseContactFormAutomationSettings.mockReturnValueOnce(
            mockEmptyAutomationSettings
        )
        render(
            <Provider store={mockStore}>
                <ContactFormWithShopIntegration
                    contactForm={ContactFormFixture}
                    isFormHidden={true}
                    shopIntegration={shopifyShopIntegrationFixture}
                />
            </Provider>
        )

        expect(screen.getByText('Write your message')).toBeInTheDocument()
    })
})
