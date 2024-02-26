import 'tests/__mocks__/intersectionObserverMock'

import React, {ComponentProps} from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {SupportedLocalesProvider} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {WizardContext} from 'pages/common/components/wizard/Wizard'
import {HelpCenter, HelpCenterCreationWizardStep} from 'models/helpCenter/types'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import {StoreState} from 'state/types'
import {chatIntegrationFixtures} from 'fixtures/chat'
import {shopifyIntegration} from 'fixtures/integrations'
import {Integration} from 'models/integration/types'
import {proMonthlyHelpdeskPrice as mockedProMonthlyHelpdeskPrice} from 'fixtures/productPrices'
import useWorkflowConfigurations from 'pages/automate/common/hooks/useWorkflowConfigurations'
import {
    HELP_CENTER_DEFAULT_LOCALE,
    HelpCenterCreationWizard,
    NEXT_ACTION,
    PlatformType,
} from 'pages/settings/helpCenter/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useHelpCenterAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import {useGetHelpCenterArticleList} from 'models/helpCenter/queries'
import {createWorkflowConfigurationShallow} from 'fixtures/workflows'
import {selfServiceConfiguration1} from 'fixtures/self_service_configurations'
import HelpCenterCreationWizardStepAutomate from '../HelpCenterCreationWizardStepAutomate'
import {useHelpCenterCreationWizard} from '../../../hooks/useHelpCenterCreationWizard'

jest.mock('pages/automate/common/hooks/useWorkflowConfigurations', () =>
    jest.fn()
)
jest.mock('pages/automate/common/hooks/useHelpCenterAutomationSettings')
jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('models/helpCenter/queries')
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => undefined),
}))
jest.mock('../../../hooks/useHelpCenterCreationWizard', () => ({
    useHelpCenterCreationWizard: jest.fn(),
}))

const helpCenterFixture = {
    ...getHelpCentersResponseFixture.data[0],
    shop_name: shopifyIntegration.name,
}
const mockOnSave = jest.fn()
const mockOnAction = jest.fn()
const mockOnAutomationSettingsUpdate = jest.fn()
const mockSelfServiceConfigUpdate = jest.fn()
const defaultHelpCenter: HelpCenterCreationWizard = {
    name: 'My brand',
    subdomain: 'my-brand',
    defaultLocale: HELP_CENTER_DEFAULT_LOCALE,
    supportedLocales: [HELP_CENTER_DEFAULT_LOCALE],
    platformType: PlatformType.ECOMMERCE,
    stepName: HelpCenterCreationWizardStep.Basics,
    shopName: 'shop-test',
    brandLogoUrl: null,
    primaryColor: '',
    primaryFontFamily: '',
    deactivated: true,
}
const mockedUseHelpCenterWizardHook = {
    helpCenter: defaultHelpCenter,
    handleFormUpdate: jest.fn(),
    handleSave: mockOnSave,
    handleAction: mockOnAction,
    isLoading: false,
    allStoreIntegrations: [],
}

const defaultUseSelfServiceConfiguration = {
    isFetchPending: false,
    isUpdatePending: false,
    handleSelfServiceConfigurationUpdate: mockSelfServiceConfigUpdate,
    storeIntegration: undefined,
    selfServiceConfiguration: undefined,
}

const mockStore = configureMockStore([thunk])
const mockedUseWorkflowConfigurations = jest.mocked(useWorkflowConfigurations)
const mockUseHelpCenterCreationWizard = jest.mocked(useHelpCenterCreationWizard)
const mockUseHelpCenterAutomationSettings = jest.mocked(
    useHelpCenterAutomationSettings
)
const mockedUseSelfServiceConfiguration = jest.mocked(
    useSelfServiceConfiguration
)
const mockedUseGetHelpCenterArticleList = jest.mocked(
    useGetHelpCenterArticleList
)

const renderComponent = (
    props: Partial<ComponentProps<typeof HelpCenterCreationWizardStepAutomate>>,
    fixtures?: {integrations?: Integration[]; helpCenter?: HelpCenter}
) => {
    const {
        integrations = [shopifyIntegration, ...chatIntegrationFixtures],
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
        mockUseHelpCenterCreationWizard.mockReturnValue(
            mockedUseHelpCenterWizardHook
        )
        mockUseHelpCenterAutomationSettings.mockReturnValue({
            isFetchPending: false,
            automationSettings: {
                order_management: {enabled: false},
                workflows: [],
            },
            handleHelpCenterAutomationSettingsUpdate:
                mockOnAutomationSettingsUpdate,
            isUpdatePending: false,
            handleHelpCenterAutomationSettingsFetch: jest.fn(),
        })
        mockedUseSelfServiceConfiguration.mockReturnValue(
            defaultUseSelfServiceConfiguration
        )
        mockedUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
        } as unknown as ReturnType<typeof useGetHelpCenterArticleList>)
    })
    it('should render', () => {
        renderComponent({})

        expect(screen.getAllByText('Automate')[0]).toBeInTheDocument()
        expect(screen.getByText('Order management')).toBeInTheDocument()
    })

    it('should show error state when no store integration', () => {
        const helpCenter = {
            ...helpCenterFixture,
            shop_name: null,
        }
        renderComponent({}, {helpCenter})

        expect(screen.queryByText('Order management')).not.toBeInTheDocument()

        expect(notify).toHaveBeenNthCalledWith(1, {
            status: NotificationStatus.Error,
            message: 'No integration found for shop ',
        })
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
            ).toBeChecked()
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
            ).not.toBeChecked()
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
            ).not.toBeChecked()
        })
    })

    describe('article recommendation', () => {
        it('should be enabled by default when no article recomm with different help center', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    article_recommendation_help_center_id: null,
                },
            })

            renderComponent(
                {},
                {integrations: [shopifyIntegration, ...chatIntegrationFixtures]}
            )

            expect(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i
                )
            ).toBeChecked()
            expect(
                screen.getByText('Article Recommendation')
            ).toBeInTheDocument()
        })

        it('should be disabled by default when article recomm with different help center', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    article_recommendation_help_center_id: 999,
                },
            })

            renderComponent(
                {},
                {integrations: [shopifyIntegration, ...chatIntegrationFixtures]}
            )

            expect(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i
                )
            ).not.toBeChecked()
            expect(
                screen.getByText(
                    'You already have another Help Center used for article recommendations. By turning this setting on, articles will be surfaced in your chat from this Help Center instead.'
                )
            ).toBeInTheDocument()
        })

        it('should be enabled when article recomm with same help center', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    article_recommendation_help_center_id: helpCenterFixture.id,
                },
            })

            renderComponent(
                {},
                {
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                    ],
                    helpCenter: helpCenterFixture,
                }
            )

            expect(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i
                )
            ).toBeChecked()
        })

        it('should hide article recommendation whe no chat integrations', () => {
            renderComponent(
                {},
                {
                    integrations: [shopifyIntegration],
                }
            )

            expect(
                screen.queryByLabelText(/Article Recommendation/i)
            ).not.toBeInTheDocument()
        })

        it('should not call article recomm update when article recomm is exist and not changed', async () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    article_recommendation_help_center_id: 999,
                },
            })

            renderComponent({})

            fireEvent.click(screen.getByText('Finish'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockSelfServiceConfigUpdate).not.toHaveBeenCalled()
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

        it('should not render flows section when no workflow available', () => {
            mockedUseWorkflowConfigurations.mockReturnValue({
                isFetchPending: false,
                workflowConfigurations: [],
            })

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

            expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        })

        it('should not render show more when available flow is 0', () => {
            const workflowConfigurations = [
                createWorkflowConfigurationShallow('1'),
            ]
            mockedUseWorkflowConfigurations.mockReturnValue({
                isFetchPending: false,
                workflowConfigurations,
            })
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    workflows_entrypoints: workflowConfigurations.map(
                        (config) => ({
                            workflow_id: config.id,
                        })
                    ),
                },
            })

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

    describe('on save', () => {
        it('should call handleSave when clicked finished', async () => {
            const draft = {}

            renderComponent({})

            fireEvent.click(screen.getByText('Finish'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockOnSave).toHaveBeenCalledWith({
                payload: {orderManagementEnabled: false, wizardCompleted: true},
                redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                successModalParams: {
                    articlesCount: undefined,
                    isArticleRecommendationEnabled: true,
                },
            })
            expect(mockOnAutomationSettingsUpdate).toHaveBeenCalledWith({
                workflows: [],
            })
            expect(mockSelfServiceConfigUpdate).toHaveBeenCalled()

            // Hack to check what is being passed to the draft function
            const draftFunction = (
                mockSelfServiceConfigUpdate.mock.calls[0] as [
                    (draft: unknown) => void
                ]
            )[0]
            draftFunction(draft)
            expect(draft).toEqual({
                article_recommendation_help_center_id: helpCenterFixture.id,
            })
        })

        it('should article recomm should be disabled when no chat integrations', async () => {
            renderComponent({}, {integrations: [shopifyIntegration]})

            fireEvent.click(screen.getByText('Finish'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockOnSave).toHaveBeenCalledWith({
                payload: {orderManagementEnabled: false, wizardCompleted: true},
                redirectTo: NEXT_ACTION.NEW_HELP_CENTER,
                successModalParams: {
                    articlesCount: undefined,
                    isArticleRecommendationEnabled: false,
                },
            })
        })

        it('should call handleSave when clicked save and continue later', async () => {
            const draft = {}

            renderComponent({})

            fireEvent.click(screen.getByText('Save & Customize Later'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockOnSave).toHaveBeenCalledWith({
                redirectTo: NEXT_ACTION.BACK_HOME,
                stepName: HelpCenterCreationWizardStep.Automate,
                payload: {
                    orderManagementEnabled: false,
                },
            })
            expect(mockOnAutomationSettingsUpdate).toHaveBeenCalledWith({
                workflows: [],
            })
            expect(mockSelfServiceConfigUpdate).toHaveBeenCalled()

            // Hack to check what is being passed to the draft function
            const draftFunction = (
                mockSelfServiceConfigUpdate.mock.calls[0] as [
                    (draft: unknown) => void
                ]
            )[0]
            draftFunction(draft)
            expect(draft).toEqual({
                article_recommendation_help_center_id: helpCenterFixture.id,
            })
        })

        it('should not call handleSave when clicked back', () => {
            renderComponent({})

            fireEvent.click(screen.getByText('Back'))

            expect(mockOnSave).not.toBeCalled()
            expect(mockOnAction).toHaveBeenCalledWith(NEXT_ACTION.PREVIOUS_STEP)
        })
    })
})
