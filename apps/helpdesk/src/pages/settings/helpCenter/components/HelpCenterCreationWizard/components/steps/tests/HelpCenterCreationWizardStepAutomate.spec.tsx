import 'tests/__mocks__/intersectionObserverMock'

import type { ComponentProps } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { chatIntegrationFixtures } from 'fixtures/chat'
import {
    bigCommerceIntegration,
    shopifyIntegration,
} from 'fixtures/integrations'
import { proMonthlyHelpdeskPlan as mockedProMonthlyHelpdeskPlan } from 'fixtures/plans'
import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import { createWorkflowConfigurationShallow } from 'fixtures/workflows'
import {
    useGetHelpCenterArticleList,
    useGetHelpCenterList,
} from 'models/helpCenter/queries'
import type { HelpCenter } from 'models/helpCenter/types'
import { HelpCenterCreationWizardStep } from 'models/helpCenter/types'
import type { Integration } from 'models/integration/types'
import { useGetWorkflowConfigurations } from 'models/workflows/queries'
import useHelpCenterAutomationSettings from 'pages/automate/common/hooks/useHelpCenterAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { WizardContext } from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import type { HelpCenterCreationWizard } from 'pages/settings/helpCenter/constants'
import {
    HELP_CENTER_DEFAULT_LAYOUT,
    HELP_CENTER_DEFAULT_LOCALE,
    NEXT_ACTION,
    PlatformType,
} from 'pages/settings/helpCenter/constants'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { StoreState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useHelpCenterCreationWizard } from '../../../hooks/useHelpCenterCreationWizard'
import HelpCenterCreationWizardStepAutomate from '../HelpCenterCreationWizardStepAutomate'

jest.mock('models/workflows/queries', () => ({
    useGetWorkflowConfigurations: jest.fn(),
}))
jest.mock('pages/automate/common/hooks/useHelpCenterAutomationSettings')
jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')
jest.mock('models/helpCenter/queries')
jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(() => () => undefined),
}))
jest.mock('../../../hooks/useHelpCenterCreationWizard', () => ({
    useHelpCenterCreationWizard: jest.fn(),
}))
jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(),
    }),
)

const helpCenterFixture = {
    ...getHelpCentersResponseFixture.data[0],
    shop_name: shopifyIntegration.name,
}
const mockOnFormUpdate = jest.fn()
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
    shopIntegrationId: 1,
    brandLogoUrl: null,
    primaryColor: '',
    primaryFontFamily: '',
    deactivated: true,
    layout: HELP_CENTER_DEFAULT_LAYOUT,
}
const mockedUseHelpCenterWizardHook = {
    helpCenter: defaultHelpCenter,
    handleFormUpdate: mockOnFormUpdate,
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
const mockedUseWorkflowConfigurations = jest.mocked(
    useGetWorkflowConfigurations,
)
const mockUseHelpCenterCreationWizard = jest.mocked(useHelpCenterCreationWizard)
const mockUseHelpCenterAutomationSettings = jest.mocked(
    useHelpCenterAutomationSettings,
)
const mockedUseSelfServiceConfiguration = jest.mocked(
    useSelfServiceConfiguration,
)
const mockedUseGetHelpCenterArticleList = jest.mocked(
    useGetHelpCenterArticleList,
)
const mockedUseGetHelpCenterList = jest.mocked(useGetHelpCenterList)
const mockedUseIsArticleRecommendationsEnabledWhileSunset = jest.mocked(
    useIsArticleRecommendationsEnabledWhileSunset,
)

const renderComponent = (
    props: Partial<ComponentProps<typeof HelpCenterCreationWizardStepAutomate>>,
    fixtures?: { integrations?: Integration[]; helpCenter?: HelpCenter },
) => {
    const {
        integrations = [
            shopifyIntegration,
            bigCommerceIntegration,
            ...chatIntegrationFixtures,
        ],
        helpCenter = helpCenterFixture,
    } = fixtures ?? {}
    const defaultStore = {
        billing: fromJS({ products: [mockedProMonthlyHelpdeskPlan] }),
        integrations: fromJS({ integrations }),
        entities: {
            contactForm: {
                contactForms: { contactFormById: {} },
                contactFormsAutomationSettings: {
                    automationSettingsByContactFormId: {},
                },
            },
            helpCenter: {
                helpCenters: {
                    helpCentersById: { [helpCenter.id]: helpCenter },
                },
                helpCentersAutomationSettings: {
                    automationSettingsByHelpCenterId: {},
                },
            },
            chatsApplicationAutomationSettings: {},
            selfServiceConfigurations: {},
        },
    } as unknown as StoreState

    const queryClientMock = mockQueryClient()
    render(
        <QueryClientProvider client={queryClientMock}>
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
                        <WizardStep
                            name={HelpCenterCreationWizardStep.Automate}
                        >
                            <HelpCenterCreationWizardStepAutomate
                                isUpdate={false}
                                helpCenter={helpCenter}
                                {...props}
                            />
                        </WizardStep>
                    </WizardContext.Provider>
                </SupportedLocalesProvider>
            </Provider>
        </QueryClientProvider>,
    )
}

describe('<HelpCenterCreationWizardStepAutomate />', () => {
    beforeEach(() => {
        mockedUseWorkflowConfigurations.mockReturnValue({
            isLoading: false,
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
        mockUseHelpCenterCreationWizard.mockReturnValue(
            mockedUseHelpCenterWizardHook,
        )
        mockUseHelpCenterAutomationSettings.mockReturnValue({
            isFetchPending: false,
            automationSettings: {
                order_management: { enabled: false },
                workflows: [],
            },
            handleHelpCenterAutomationSettingsUpdate:
                mockOnAutomationSettingsUpdate,
            isUpdatePending: false,
            handleHelpCenterAutomationSettingsFetch: jest.fn(),
        })
        mockedUseSelfServiceConfiguration.mockReturnValue(
            defaultUseSelfServiceConfiguration,
        )
        mockedUseGetHelpCenterArticleList.mockReturnValue({
            data: null,
        } as unknown as ReturnType<typeof useGetHelpCenterArticleList>)

        mockedUseGetHelpCenterList.mockReturnValue({
            data: null,
        } as unknown as ReturnType<typeof useGetHelpCenterList>)

        mockedUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue({
            enabledInSettings: true,
            enabledInStatistics: true,
        })
    })
    it('should render', () => {
        renderComponent({})

        expect(screen.getAllByText('AI Agent')[0]).toBeInTheDocument()
        expect(screen.getByText('Connect a store')).toBeInTheDocument()
        expect(screen.getByText('Order management')).toBeInTheDocument()
    })

    it('should hide Automation items when no store integration', () => {
        const helpCenter = {
            ...helpCenterFixture,
            shop_name: null,
        }
        renderComponent({}, { helpCenter })

        expect(screen.getByText('Connect a store')).toBeInTheDocument()
        expect(screen.queryByText('Order management')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Article Recommendation'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Flows')).not.toBeInTheDocument()
    })

    describe('order management', () => {
        it('should render toggle off order management when order management in help center disabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: null,
            }
            renderComponent({ helpCenter })

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center',
                ),
            ).toBeChecked()
        })
        it('should render toggle on order management when order management is enabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: '2021-05-17T18:21:42.022Z',
            }
            renderComponent({ helpCenter })

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center',
                ),
            ).not.toBeChecked()
        })

        it('should enabled order management when toggle from disabled', () => {
            const helpCenter = {
                ...helpCenterFixture,
                self_service_deactivated_datetime: null,
            }
            renderComponent({ helpCenter })

            // userEvent not working here. I don't find the reason why
            fireEvent.click(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center',
                ),
            )

            expect(
                screen.getByLabelText(
                    'Allow customers to manage orders from my Help Center',
                ),
            ).not.toBeChecked()
        })
    })

    describe('article recommendation', () => {
        it('should be toggled on by default when no article recomm with different help center', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    articleRecommendationHelpCenterId: null,
                },
            })

            renderComponent(
                {},
                {
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                    ],
                },
            )

            expect(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i,
                ),
            ).toBeChecked()
            expect(
                screen.getByText('Article Recommendation'),
            ).toBeInTheDocument()
        })

        it('should be toggled off by default when article recomm with different help center', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    articleRecommendationHelpCenterId: 999,
                },
            })

            renderComponent(
                {},
                {
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                    ],
                },
            )

            expect(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i,
                ),
            ).not.toBeChecked()
            expect(
                screen.getByText(
                    'You already have another Help Center used for article recommendations. By turning this setting on, articles will be surfaced in your chat from this Help Center instead.',
                ),
            ).toBeInTheDocument()
        })

        it('should be toggled on when article recomm with same help center', () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    articleRecommendationHelpCenterId: helpCenterFixture.id,
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
                },
            )

            expect(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i,
                ),
            ).toBeChecked()
        })

        it('should hide article recommendation when there is no chat integrations', () => {
            renderComponent(
                {},
                {
                    integrations: [shopifyIntegration],
                },
            )

            expect(
                screen.queryByLabelText(/Article Recommendation/i),
            ).not.toBeInTheDocument()
        })

        it('should hide article recommendation when killswitch is enabled', () => {
            mockedUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue(
                {
                    enabledInSettings: false,
                    enabledInStatistics: false,
                },
            )

            renderComponent(
                {},
                {
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                    ],
                },
            )

            expect(
                screen.queryByText('Article Recommendation'),
            ).not.toBeInTheDocument()
        })

        it('should not call article recomm update when article recomm is exist and not changed', async () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    articleRecommendationHelpCenterId: 999,
                },
            })

            renderComponent({})

            fireEvent.click(screen.getByText('Finish'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockSelfServiceConfigUpdate).not.toHaveBeenCalled()
        })
    })

    describe('flows', () => {
        it('should not render flows section when no store integrations', () => {
            renderComponent(
                {},
                {
                    integrations: chatIntegrationFixtures,
                },
            )

            expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        })

        it('should not render flows section when no workflow available', () => {
            mockedUseWorkflowConfigurations.mockReturnValue({
                isLoading: false,
                data: [],
            } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)

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
                },
            )

            expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        })

        it('should not render show more when available flow is 0', () => {
            const workflowConfigurations = [
                createWorkflowConfigurationShallow('1'),
            ]
            mockedUseWorkflowConfigurations.mockReturnValue({
                isLoading: false,
                data: workflowConfigurations,
            } as unknown as ReturnType<typeof useGetWorkflowConfigurations>)
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    workflowsEntrypoints: workflowConfigurations.map(
                        (config) => ({
                            workflow_id: config.id,
                        }),
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
                },
            )

            expect(screen.getByText('Flows')).toBeInTheDocument()
            expect(screen.queryByText('Show More')).not.toBeInTheDocument()
        })
    })

    describe('on save', () => {
        it('should call handleSave when store selected is changed', async () => {
            renderComponent({})

            expect(screen.getByText('Connect a store')).toBeInTheDocument()
            fireEvent.click(screen.getByText('bigCommerce store'))

            await waitFor(() => expect(mockOnFormUpdate).toBeCalled())
            expect(mockOnFormUpdate).toHaveBeenCalledWith({
                shopName: 'bigCommerce store',
                shopIntegrationId: 9,
            })

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockOnSave).toHaveBeenCalledWith({
                stepName: HelpCenterCreationWizardStep.Automate,
                payload: {
                    shopName: 'bigCommerce store',
                    shopIntegrationId: 9,
                },
            })
        })
        it('should call handleSave when clicked finished', async () => {
            const draft = {}

            renderComponent({})

            fireEvent.click(screen.getByText('Finish'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockOnSave).toHaveBeenCalledWith({
                payload: {
                    orderManagementEnabled: false,
                    wizardCompleted: true,
                },
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
                    (draft: unknown) => void,
                ]
            )[0]
            draftFunction(draft)
            expect(draft).toEqual({
                articleRecommendationHelpCenterId: helpCenterFixture.id,
            })
        })

        it('should article recomm should be disabled when no chat integrations', async () => {
            renderComponent({}, { integrations: [shopifyIntegration] })

            fireEvent.click(screen.getByText('Finish'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockOnSave).toHaveBeenCalledWith({
                payload: {
                    orderManagementEnabled: false,
                    wizardCompleted: true,
                },
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
                    (draft: unknown) => void,
                ]
            )[0]
            draftFunction(draft)
            expect(draft).toEqual({
                articleRecommendationHelpCenterId: helpCenterFixture.id,
            })
        })

        it('should not call handleSave when clicked back', () => {
            renderComponent({})

            fireEvent.click(screen.getByText('Back'))

            expect(mockOnSave).not.toBeCalled()
            expect(mockOnAction).toHaveBeenCalledWith(NEXT_ACTION.PREVIOUS_STEP)
        })

        it('should not update article recommendation when killswitch is enabled', async () => {
            mockedUseIsArticleRecommendationsEnabledWhileSunset.mockReturnValue(
                {
                    enabledInSettings: false,
                    enabledInStatistics: false,
                },
            )

            renderComponent(
                {},
                {
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                    ],
                },
            )

            const user = userEvent.setup()
            await user.click(screen.getByText('Finish'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockSelfServiceConfigUpdate).not.toHaveBeenCalled()
        })

        it('should clear article recommendation when disabled for current help center', async () => {
            const draft = {}
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    articleRecommendationHelpCenterId: helpCenterFixture.id,
                },
            })

            renderComponent(
                {},
                {
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                    ],
                },
            )

            fireEvent.click(
                screen.getByLabelText(
                    /Recommend articles from this Help Center in my Chat/i,
                ),
            )
            fireEvent.click(screen.getByText('Finish'))

            await waitFor(() =>
                expect(mockSelfServiceConfigUpdate).toBeCalled(),
            )
            const draftFunction = (
                mockSelfServiceConfigUpdate.mock.calls[0] as [
                    (draft: unknown) => void,
                ]
            )[0]
            draftFunction(draft)
            expect(draft).toEqual({
                articleRecommendationHelpCenterId: undefined,
            })
        })

        it('should not update when article recommendation already set for same help center', async () => {
            mockedUseSelfServiceConfiguration.mockReturnValue({
                ...defaultUseSelfServiceConfiguration,
                selfServiceConfiguration: {
                    ...selfServiceConfiguration1,
                    articleRecommendationHelpCenterId: helpCenterFixture.id,
                },
            })

            renderComponent(
                {},
                {
                    integrations: [
                        shopifyIntegration,
                        ...chatIntegrationFixtures,
                    ],
                },
            )

            fireEvent.click(screen.getByText('Finish'))

            await waitFor(() => expect(mockOnSave).toBeCalled())
            expect(mockSelfServiceConfigUpdate).not.toHaveBeenCalled()
        })
    })
})
