import 'tests/__mocks__/intersectionObserverMock'

import React, {ComponentProps} from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {SupportedLocalesProvider} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {WizardContext} from 'pages/common/components/wizard/Wizard'
import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import {RootState, StoreDispatch, StoreState} from 'state/types'
import {chatIntegrationFixtures} from 'fixtures/chat'
import {shopifyIntegration} from 'fixtures/integrations'
import {Integration} from 'models/integration/types'
import {proMonthlyHelpdeskPrice as mockedProMonthlyHelpdeskPrice} from 'fixtures/productPrices'
import useWorkflowConfigurations from 'pages/automate/common/hooks/useWorkflowConfigurations'
import HelpCenterCreationWizardStepAutomate from '../HelpCenterCreationWizardStepAutomate'

jest.mock('pages/automate/common/hooks/useWorkflowConfigurations', () =>
    jest.fn()
)

const helpCenterFixture = getHelpCentersResponseFixture.data[0]

const mockStore = configureMockStore<RootState, StoreDispatch>()
const mockedUseWorkflowConfigurations = jest.mocked(useWorkflowConfigurations)

const renderComponent = (
    props: Partial<ComponentProps<typeof HelpCenterCreationWizardStepAutomate>>,
    fixtures?: {integrations?: Integration[]; helpCenter?: HelpCenter}
) => {
    const {
        integrations = chatIntegrationFixtures,
        helpCenter = helpCenterFixture,
    } = fixtures ?? {}
    const defaultStore = {
        billing: fromJS({products: [mockedProMonthlyHelpdeskPrice]}),
        integrations: fromJS({integrations}),
        entities: {
            contactForm: {contactForms: {contactFormById: {}}},
            helpCenter: {
                helpCenters: {helpCentersById: {[helpCenter.id]: helpCenter}},
                helpCentersAutomationSettings: {
                    automationSettingsByHelpCenterId: {},
                },
            },
            selfServiceConfigurations: {},
        },
    } as unknown as StoreState

    render(
        <Provider store={mockStore(defaultStore)}>
            <SupportedLocalesProvider>
                <WizardContext.Provider
                    value={{
                        steps: [HelpCenterCreationWizardStep.Automate],
                        activeStepIndex: 0,
                        setActiveStep: jest.fn(),
                        totalSteps: 1,
                        activeStep: HelpCenterCreationWizardStep.Automate,
                        nextStep: undefined,
                        previousStep: undefined,
                    }}
                >
                    <WizardStep name={HelpCenterCreationWizardStep.Automate}>
                        <HelpCenterCreationWizardStepAutomate
                            isUpdate={false}
                            helpCenter={helpCenter}
                            {...props}
                        />
                    </WizardStep>
                </WizardContext.Provider>
            </SupportedLocalesProvider>
        </Provider>
    )
}

describe('<HelpCenterCreationWizardStepAutomate />', () => {
    beforeEach(() => {
        mockedUseWorkflowConfigurations.mockReturnValue({
            isFetchPending: false,
            workflowConfigurations: [],
        })
    })
    it('should render', () => {
        renderComponent({})

        expect(screen.getAllByText('Automate')[0]).toBeInTheDocument()
        expect(screen.getByText('Order management')).toBeInTheDocument()
    })

    describe('order management', () => {
        it('should render disabled order management when order management in help center disabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: null,
            }
            renderComponent({helpCenter})

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center'
                )
            ).not.toBeChecked()
        })
        it('should render enabled order management when order management is enabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: '2021-05-17T18:21:42.022Z',
            }
            renderComponent({helpCenter})

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center'
                )
            ).toBeChecked()
        })

        it('should enabled order management when toggle from disabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: null,
            }
            renderComponent({helpCenter})

            // userEvent not working here. I don't find the reason why
            fireEvent.click(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center'
                )
            )

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center'
                )
            ).toBeChecked()
        })
    })

    describe('article recommendation', () => {
        it('should be enabled by default and show chat integration', () => {
            renderComponent({})

            expect(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i
                )
            ).toBeChecked()
            expect(
                screen.getByLabelText(/Connect a Chat integration/i)
            ).toBeInTheDocument()
        })

        it('should toggle article recommendation and hide chat integration', () => {
            renderComponent({})

            fireEvent.click(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i
                )
            )

            expect(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i
                )
            ).not.toBeChecked()
            expect(
                screen.queryByLabelText(/Connect a Chat integration/i)
            ).not.toBeInTheDocument()
        })

        it('should select chat from dropdown', async () => {
            const chatName = chatIntegrationFixtures[0].name
            renderComponent({})

            fireEvent.click(
                screen.getByLabelText(/Connect a Chat integration/i)
            )

            await waitFor(() =>
                expect(screen.getByText(chatName)).toBeInTheDocument()
            )

            fireEvent.click(screen.getByText(chatName))

            expect(
                screen.getByTestId('selected-chat-integration')
            ).toHaveTextContent(chatName)
        })
    })

    describe('flows', () => {
        it('should not render flows section when no shopify integration', () => {
            renderComponent(
                {},
                {
                    integrations: chatIntegrationFixtures,
                }
            )

            expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        })

        it('should not render show more when available flow is 0', () => {
            renderComponent(
                {},
                {
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                    ],
                    helpCenter: {
                        ...helpCenterFixture,
                        shop_name: shopifyIntegration.name,
                    },
                }
            )

            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(screen.queryByText('Show More')).not.toBeInTheDocument()
        })
    })
})
