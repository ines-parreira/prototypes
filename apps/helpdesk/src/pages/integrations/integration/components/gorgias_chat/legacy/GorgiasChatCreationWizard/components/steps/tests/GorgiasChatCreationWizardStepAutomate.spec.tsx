import type React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { entitiesInitialState } from 'fixtures/entities'
import { integrationsStateWithShopify } from 'fixtures/integrations'
import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasChatCreationWizardSteps } from 'models/integration/types'
import { useGetSelfServiceConfiguration } from 'models/selfServiceConfiguration/queries'
import Wizard from 'pages/common/components/wizard/Wizard'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { DndProvider } from 'utils/wrappers/DndProvider'

import useHelpCenterOfShop from '../../../../hooks/useHelpCenterOfShop'
import GorgiasChatCreationWizardStepAutomate from '../GorgiasChatCreationWizardStepAutomate'

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false,
)

jest.mock('hooks/useAppDispatch')

const mockStore = configureMockStore([thunk])

const store = mockStore({
    entities: {
        ...entitiesInitialState,
        chatsApplicationAutomationSettings: {
            1: {},
        },
    },
    integrations: integrationsStateWithShopify,
    billing: fromJS({ products: [] }),
})
store.dispatch = jest.fn()
jest.mock('state/integrations/actions', () => ({
    updateOrCreateIntegration: jest.fn(),
}))
const queryClient = mockQueryClient()

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    decoration: {},
    meta: {
        language: 'en-US',
        app_id: 1,
        shop_integration_id: 1,
    },
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepAutomate
> = {
    isSubmitting: false,
    integration,
}
jest.mock('models/selfServiceConfiguration/queries', () => ({
    useGetSelfServiceConfiguration: jest.fn(() => ({
        data: null,
        isLoading: false,
    })),
    useUpdateSelfServiceConfiguration: jest.fn(() => ({
        data: null,
        isLoading: false,
    })),
}))
jest.mock('../../../../hooks/useHelpCenterOfShop', () => {
    return jest.fn(() => ({
        helpCenters: [],
        isLoadingHelpCenters: false,
    }))
})
const mockUseGetSelfServiceConfiguration =
    useGetSelfServiceConfiguration as jest.MockedFunction<
        typeof useGetSelfServiceConfiguration
    >
describe('<GorgiasChatCreationWizardStepAutomate.spec />', () => {
    it('renders wizard without store selected', () => {
        const { getByText } = render(
            <DndProvider backend={HTML5Backend}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <Provider store={store}>
                            <Wizard
                                steps={[
                                    GorgiasChatCreationWizardSteps.Automate,
                                ]}
                            >
                                <GorgiasChatCreationWizardStepAutomate
                                    {...minProps}
                                />
                            </Wizard>
                        </Provider>
                    </MemoryRouter>
                </QueryClientProvider>
            </DndProvider>,
        )

        expect(getByText('Connect a store')).toBeInTheDocument()
    })

    it('does not proceed with update when selfServiceConfiguration is not available', () => {
        // Mock the dispatch function
        const mockDispatch = jest.fn()
        ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)

        // Render the component with selfServiceConfiguration as undefined
        const { getAllByRole } = render(
            <DndProvider backend={HTML5Backend}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <Provider store={store}>
                            <Wizard
                                steps={[
                                    GorgiasChatCreationWizardSteps.Automate,
                                ]}
                            >
                                <GorgiasChatCreationWizardStepAutomate
                                    {...minProps}
                                    isSubmitting={false}
                                    integration={fromJS(undefined)}
                                />
                            </Wizard>
                        </Provider>
                    </MemoryRouter>
                </QueryClientProvider>
            </DndProvider>,
        )

        const labelElements = getAllByRole('switch')

        labelElements.forEach((labelElement) => {
            expect(labelElement.className).toMatch(/disabledlabel/i)
        })
    })

    it('disables form when isLoadingSelfServiceConfiguration is true', () => {
        mockUseGetSelfServiceConfiguration.mockReturnValue({
            data: null,
            isLoading: true,
        } as any)

        const { getAllByRole } = render(
            <DndProvider backend={HTML5Backend}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <Provider store={store}>
                            <Wizard
                                steps={[
                                    GorgiasChatCreationWizardSteps.Automate,
                                ]}
                            >
                                <GorgiasChatCreationWizardStepAutomate
                                    {...minProps}
                                    integration={fromJS({
                                        meta: {
                                            app_id: 1,
                                        },
                                    })}
                                />
                            </Wizard>
                        </Provider>
                    </MemoryRouter>
                </QueryClientProvider>
            </DndProvider>,
        )

        const labelElements = getAllByRole('switch')

        labelElements.forEach((labelElement) => {
            expect(labelElement.className).toMatch(/disabledlabel/i)
        })
    })
    it('disables form when isLoadingHelpCenters is true', () => {
        mockUseGetSelfServiceConfiguration.mockReturnValue({
            data: null,
            isLoading: false,
        } as any)
        const mockUseHelpCenterOfShop =
            useHelpCenterOfShop as jest.MockedFunction<
                typeof useHelpCenterOfShop
            >

        mockUseHelpCenterOfShop.mockReturnValue({
            helpCenters: [],
            isLoadingHelpCenters: true,
        } as any)

        const { getAllByRole } = render(
            <DndProvider backend={HTML5Backend}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <Provider store={store}>
                            <Wizard
                                steps={[
                                    GorgiasChatCreationWizardSteps.Automate,
                                ]}
                            >
                                <GorgiasChatCreationWizardStepAutomate
                                    {...minProps}
                                    integration={fromJS({
                                        meta: {
                                            app_id: 1,
                                        },
                                    })}
                                />
                            </Wizard>
                        </Provider>
                    </MemoryRouter>
                </QueryClientProvider>
            </DndProvider>,
        )

        const labelElements = getAllByRole('switch')

        labelElements.forEach((labelElement) => {
            expect(labelElement.className).toMatch(/disabledlabel/i)
        })
    })
    it('disables form when isLoadingHelpCenters is true', () => {
        mockUseGetSelfServiceConfiguration.mockReturnValue({
            data: null,
            isLoading: false,
        } as any)
        const mockUseHelpCenterOfShop =
            useHelpCenterOfShop as jest.MockedFunction<
                typeof useHelpCenterOfShop
            >

        mockUseHelpCenterOfShop.mockReturnValue({
            helpCenters: [],
            isLoadingHelpCenters: true,
        } as any)

        const { getByText } = render(
            <DndProvider backend={HTML5Backend}>
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <Provider store={store}>
                            <Wizard
                                steps={[
                                    GorgiasChatCreationWizardSteps.Automate,
                                ]}
                            >
                                <GorgiasChatCreationWizardStepAutomate
                                    {...minProps}
                                    integration={fromJS({
                                        meta: {
                                            app_id: 1,
                                        },
                                    })}
                                />
                            </Wizard>
                        </Provider>
                    </MemoryRouter>
                </QueryClientProvider>
            </DndProvider>,
        )

        const saveChanges = getByText('Next')
        fireEvent.click(saveChanges)
        expect(updateOrCreateIntegration).toHaveBeenCalled()
    })
})
