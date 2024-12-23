import 'tests/__mocks__/intersectionObserverMock'

import {QueryClientProvider} from '@tanstack/react-query'
import {act, fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {createMemoryHistory} from 'history'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    AiAgentOnboardingWizardStep,
    AiAgentOnboardingWizardType,
} from 'models/aiAgent/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, renderWithRouter} from 'utils/testing'

import {
    ARTICLE_INGESTION_LOGS_STATUS,
    WIZARD_BUTTON_ACTIONS,
    WizardPostCompletionPathway,
} from '../../constants'
import {getStoreConfigurationFormValuesFixture} from '../../fixtures/onboardingWizard.fixture'
import {getStoreConfigurationFixture} from '../../fixtures/storeConfiguration.fixtures'
import {useFileIngestion} from '../../hooks/useFileIngestion'
import {usePublicResourcesPooling} from '../../hooks/usePublicResourcesPooling'
import AiAgentOnboardingWizardStepKnowledge from '../AiAgentOnboardingWizardKnowledge'
import {useAiAgentOnboardingWizard} from '../hooks/useAiAgentOnboardingWizard'

const SHOP_NAME = 'test-shop'
const SHOP_TYPE = 'shopify'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

jest.mock('../hooks/useAiAgentOnboardingWizard')
const mockUseAiAgentOnboardingWizard = assumeMock(useAiAgentOnboardingWizard)

jest.mock('../../hooks/useFileIngestion')
const mockUseFileIngestion = assumeMock(useFileIngestion)

jest.mock('pages/automate/aiAgent/hooks/usePublicResourcesPooling', () => ({
    usePublicResourcesPooling: jest.fn(),
}))
const mockUsePublicResourcesPooling = assumeMock(usePublicResourcesPooling)

const mockedHelpCenters = getHelpCentersResponseFixture.data
const mockedStoreConfiguration = getStoreConfigurationFixture()

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        AiAgentOnboardingWizardPublicUrlIngested:
            'ai-agent-onboarding-wizard-public-url-ingested',
    },
}))

const mockedUseAiAgentOnboardingWizard = {
    storeFormValues: getStoreConfigurationFormValuesFixture(),
    faqHelpCenters: mockedHelpCenters,
    snippetHelpCenter: null,
    isLoading: false,
    isUpdateWizardSetup: false,
    handleFormUpdate: jest.fn(),
    handleSave: jest.fn(),
    handleAction: jest.fn(),
    updateValue: jest.fn(),
    storeConfiguration: mockedStoreConfiguration,
}

const queryClient = mockQueryClient()
const mockStore = configureMockStore([thunk])

const defaultState = {}
const defaultProps = {
    shopType: SHOP_TYPE,
    shopName: SHOP_NAME,
    storeConfiguration: mockedStoreConfiguration,
}

const history = createMemoryHistory()

const renderComponent = (
    props: Partial<ComponentProps<typeof AiAgentOnboardingWizardStepKnowledge>>
) => {
    const currentProps = {
        ...defaultProps,
        ...props,
    }
    renderWithRouter(
        <Router history={history}>
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <Wizard steps={[AiAgentOnboardingWizardStep.Knowledge]}>
                        <AiAgentOnboardingWizardStepKnowledge
                            {...currentProps}
                        />
                    </Wizard>
                </QueryClientProvider>
            </Provider>
        </Router>
    )
}

describe('<AiAgentOnboardingWizardKnowledge />', () => {
    beforeEach(() => {
        mockUseAiAgentOnboardingWizard.mockReturnValue(
            mockedUseAiAgentOnboardingWizard
        )
        mockFlags({
            [FeatureFlagKey.AiAgentSnippetsFromExternalFiles]: true,
        })
        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [],
            ingestFile: jest.fn(),
            deleteIngestedFile: jest.fn(),
            isIngesting: false,
            isLoading: false,
        })
        mockUsePublicResourcesPooling.mockReturnValue({
            articleIngestionLogsStatus: [],
        })
    })

    it('should render the header and footer correctly', () => {
        renderComponent({})

        expect(
            screen.getByText('Add knowledge to AI Agent')
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'At least one knowledge source is required for AI Agent to reference when replying to customers. You can always add more later.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Back')).toBeInTheDocument()
        expect(screen.getByText('Finish')).toBeInTheDocument()
        expect(screen.getByText('Save & Customize Later')).toBeInTheDocument
    })

    it('should call handleAction with PREVIOUS_STEP when Back button is clicked', () => {
        renderComponent({})

        userEvent.click(screen.getByText('Back'))

        expect(
            mockedUseAiAgentOnboardingWizard.handleAction
        ).toHaveBeenCalledWith(WIZARD_BUTTON_ACTIONS.PREVIOUS_STEP)
    })

    it('should call handleSave with SAVE_AND_CUSTOMIZE_LATER when Save & Customize Later button is clicked', () => {
        renderComponent({})

        userEvent.click(screen.getByText('Save & Customize Later'))

        expect(
            mockedUseAiAgentOnboardingWizard.handleSave
        ).toHaveBeenCalledWith({
            publicUrls: [],
            redirectTo: WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER,
        })
    })

    it('should call handleSave and redirect to test tab when Finish button is clicked', () => {
        renderComponent({})

        userEvent.click(screen.getByText('Finish'))

        expect(
            mockedUseAiAgentOnboardingWizard.handleSave
        ).toHaveBeenCalledWith({
            publicUrls: [],
            hasExternalFiles: false,
            redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_TEST,
            payload: {
                wizard: {
                    ...mockedUseAiAgentOnboardingWizard.storeFormValues.wizard,
                    completedDatetime: expect.any(String),
                    onCompletePathway: WizardPostCompletionPathway.test,
                },
            },
        })
    })

    it('should call handleSave and redirect to guidance tab when Finish button is clicked and feature flag is enabled', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentOnboardingWizardKnowledgeRedirect]: true,
        })

        renderComponent({})

        userEvent.click(screen.getByText('Finish'))

        expect(
            mockedUseAiAgentOnboardingWizard.handleSave
        ).toHaveBeenCalledWith({
            publicUrls: [],
            hasExternalFiles: false,
            redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_GUIDANCE,
            payload: {
                wizard: {
                    ...mockedUseAiAgentOnboardingWizard.storeFormValues.wizard,
                    completedDatetime: expect.any(String),
                    onCompletePathway: WizardPostCompletionPathway.guidance,
                },
            },
        })
    })

    it('should autofill the help center select when there is only 1 connected help center', () => {
        const mockedStoreConfigurationWithoutHelpCenter = {
            ...getStoreConfigurationFixture(),
            helpCenterId: null,
        }

        const mockedUseAiAgentOnboardingWizard = {
            storeFormValues: getStoreConfigurationFormValuesFixture(),
            faqHelpCenters: [{...mockedHelpCenters[0], shop_name: SHOP_NAME}],
            snippetHelpCenter: null,
            isLoading: false,
            isUpdateWizardSetup: false,
            handleFormUpdate: jest.fn(),
            handleSave: jest.fn(),
            handleAction: jest.fn(),
            updateValue: jest.fn(),
            storeConfiguration: mockedStoreConfigurationWithoutHelpCenter,
        }

        mockUseAiAgentOnboardingWizard.mockReturnValue(
            mockedUseAiAgentOnboardingWizard
        )

        renderComponent({})

        expect(
            mockedUseAiAgentOnboardingWizard.handleFormUpdate
        ).toHaveBeenCalledWith({
            helpCenterId: mockedUseAiAgentOnboardingWizard.faqHelpCenters[0].id,
        })
    })

    it('should left the help center select empty when there is no connected help center', () => {
        const mockedStoreConfigurationWithoutHelpCenter = {
            ...getStoreConfigurationFixture(),
            helpCenterId: null,
        }

        renderComponent({
            storeConfiguration: mockedStoreConfigurationWithoutHelpCenter,
        })

        expect(
            mockedUseAiAgentOnboardingWizard.handleFormUpdate
        ).not.toHaveBeenCalledWith({
            helpCenterId: mockedUseAiAgentOnboardingWizard.faqHelpCenters[0].id,
        })
    })

    it('should have Public URL sources section when snippetHelpCenter is provided', () => {
        const mockedUseAiAgentOnboardingWizard = {
            storeFormValues: getStoreConfigurationFormValuesFixture(),
            faqHelpCenters: mockedHelpCenters,
            snippetHelpCenter: mockedHelpCenters[0],
            isLoading: false,
            isUpdateWizardSetup: false,
            handleFormUpdate: jest.fn(),
            handleSave: jest.fn(),
            handleAction: jest.fn(),
            updateValue: jest.fn(),
            storeConfiguration: mockedStoreConfiguration,
        }

        mockUseAiAgentOnboardingWizard.mockReturnValue(
            mockedUseAiAgentOnboardingWizard
        )

        renderComponent({})

        expect(screen.getByText('Public URL sources')).toBeInTheDocument()
    })

    it('should call handleFormUpdate when help center select is changed', () => {
        renderComponent({})

        const selectedHelpCenter = screen.getByText(mockedHelpCenters[0].name)
        act(() => {
            fireEvent.focus(selectedHelpCenter)
        })

        const emptyHelpCenterItem = screen.getByText('No Help Center')
        act(() => {
            fireEvent.click(emptyHelpCenterItem)
        })

        expect(
            mockedUseAiAgentOnboardingWizard.handleFormUpdate
        ).toHaveBeenCalledWith({helpCenterId: null})

        act(() => {
            fireEvent.focus(selectedHelpCenter)
        })

        const newSelectedHelpCenter = screen.getByText(
            mockedHelpCenters[1].name
        )
        act(() => {
            fireEvent.click(newSelectedHelpCenter)
        })

        expect(
            mockedUseAiAgentOnboardingWizard.handleFormUpdate
        ).toHaveBeenCalledWith({helpCenterId: mockedHelpCenters[1].id})
    })

    it('should include public URL changed in handleSave', async () => {
        const mockedUseAiAgentOnboardingWizardWithSnippet = {
            ...mockedUseAiAgentOnboardingWizard,
            snippetHelpCenter: mockedHelpCenters[0],
        }

        mockUseAiAgentOnboardingWizard.mockReturnValue(
            mockedUseAiAgentOnboardingWizardWithSnippet
        )

        renderComponent({})

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const syncButton = screen.getByRole('button', {name: /Sync URL/})
        const input = screen.getByLabelText('Public URL')

        await userEvent.type(input, 'https://example.com/faqs')
        userEvent.click(syncButton)

        userEvent.click(screen.getByText('Save & Customize Later'))

        expect(
            mockedUseAiAgentOnboardingWizard.handleSave
        ).toHaveBeenCalledWith({
            publicUrls: ['https://example.com/faqs'],
            redirectTo: WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER,
        })

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentOnboardingWizardPublicUrlIngested,
            {
                step: AiAgentOnboardingWizardStep.Knowledge,
                version: AiAgentOnboardingWizardType.ThreeSteps,
                url: 'https://example.com/faqs',
            }
        )
    })

    it('should redirect to knowledge section when finishing wizard during public URL sync', async () => {
        mockUseAiAgentOnboardingWizard.mockReturnValue({
            ...mockedUseAiAgentOnboardingWizard,
            snippetHelpCenter: mockedHelpCenters[0],
            storeFormValues: getStoreConfigurationFormValuesFixture({
                helpCenterId: null,
            }),
        })

        mockUsePublicResourcesPooling.mockReturnValue({
            articleIngestionLogsStatus: [ARTICLE_INGESTION_LOGS_STATUS.PENDING],
        })

        renderComponent({})

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const syncButton = screen.getByRole('button', {name: /Sync URL/})
        const input = screen.getByLabelText('Public URL')

        await userEvent.type(input, 'https://example.com/faqs')
        userEvent.click(syncButton)

        userEvent.click(screen.getByText('Finish'))

        expect(
            mockedUseAiAgentOnboardingWizard.handleSave
        ).toHaveBeenCalledWith({
            hasExternalFiles: false,
            publicUrls: ['https://example.com/faqs'],
            redirectTo: WIZARD_BUTTON_ACTIONS.FINISH_TO_KNOWLEDGE,
            payload: {
                wizard: {
                    ...mockedUseAiAgentOnboardingWizard.storeFormValues.wizard,
                    completedDatetime: expect.any(String),
                    onCompletePathway: WizardPostCompletionPathway.knowledge,
                },
            },
        })
    })

    it('should log event when new url is ingested', async () => {
        const defaultWizard = getStoreConfigurationFormValuesFixture().wizard!
        const mockedUseAiAgentOnboardingWizardWithSnippet = {
            ...mockedUseAiAgentOnboardingWizard,
            snippetHelpCenter: mockedHelpCenters[0],
            storeFormValues: getStoreConfigurationFormValuesFixture({
                wizard: {
                    ...defaultWizard,
                    hasEducationStepEnabled: false,
                },
            }),
        }

        mockUseAiAgentOnboardingWizard.mockReturnValue(
            mockedUseAiAgentOnboardingWizardWithSnippet
        )

        renderComponent({})

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const syncButton = screen.getByRole('button', {name: /Sync URL/})
        const input = screen.getByLabelText('Public URL')

        await userEvent.type(input, 'https://example.com/faqs')
        userEvent.click(syncButton)

        userEvent.click(screen.getByText('Save & Customize Later'))

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentOnboardingWizardPublicUrlIngested,
            {
                step: AiAgentOnboardingWizardStep.Knowledge,
                version: AiAgentOnboardingWizardType.TwoSteps,
                url: 'https://example.com/faqs',
            }
        )
    })

    it('should display confirmation dialog modal when user tries to leave after changes help center select', () => {
        renderComponent({})

        const selectedHelpCenter = screen.getByText(mockedHelpCenters[0].name)
        act(() => {
            fireEvent.focus(selectedHelpCenter)
        })

        const newSelectedHelpCenter = screen.getByText(
            mockedHelpCenters[1].name
        )
        act(() => {
            fireEvent.click(newSelectedHelpCenter)
        })

        history.push('/test')

        expect(
            screen.getByText(
                'Your changes to this page will be lost if you don’t save them.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Save Changes')).toBeInTheDocument()
        expect(screen.getByText('Discard Changes')).toBeInTheDocument()

        userEvent.click(screen.getByText('Save Changes'))
        expect(
            mockedUseAiAgentOnboardingWizard.handleSave
        ).toHaveBeenCalledWith({
            publicUrls: [],
            redirectTo: WIZARD_BUTTON_ACTIONS.SAVE_AND_CUSTOMIZE_LATER,
        })
    })

    it('should display a warning notification when Finish is clicked and documents are syncing', () => {
        mockUseAiAgentOnboardingWizard.mockReturnValue({
            ...mockedUseAiAgentOnboardingWizard,
            snippetHelpCenter: mockedHelpCenters[0],
        })
        mockUseFileIngestion.mockReturnValue({
            ingestedFiles: [],
            ingestFile: jest.fn(),
            deleteIngestedFile: jest.fn(),
            isIngesting: true,
            isLoading: false,
        })

        renderComponent({})

        userEvent.click(screen.getByText('Finish'))

        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(notify).toHaveBeenCalledWith({
            message:
                'Document upload still in progress. You can finish without uploading but will lose any upload progress.',
            status: NotificationStatus.Warning,
            buttons: [
                expect.objectContaining({
                    name: 'Finish Without Upload',
                    primary: false,
                    onClick: expect.any(Function),
                }),
            ],
        })
    })
})
