import React, {FC} from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, waitFor} from '@testing-library/react'
import {renderWithRouter} from 'utils/testing'
import {
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import history from 'pages/history'
import {RootState, StoreDispatch} from 'state/types'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {integrationsState} from 'fixtures/integrations'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import Wizard from 'pages/common/components/wizard/Wizard'
import {
    HELP_CENTER_DEFAULT_LOCALE,
    HelpCenterCreationWizard,
    NEXT_ACTION,
    PlatformType,
} from 'pages/settings/helpCenter/constants'
import {IntegrationType} from 'models/integration/constants'
import {ShopifyIntegration} from 'models/integration/types'
import HelpCenterCreationWizardStepBasics from '../HelpCenterCreationWizardStepBasics'
import {useHelpCenterCreationWizard} from '../../../hooks/useHelpCenterCreationWizard'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)
jest.mock('../../../hooks/useHelpCenterCreationWizard', () => ({
    useHelpCenterCreationWizard: jest.fn(),
}))
jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false
)

const mockUseHelpCenterCreationWizard = jest.mocked(useHelpCenterCreationWizard)
const mockOnSave = jest.fn()
const mockUpdateData = jest.fn()
const mockRefetch = jest.fn()

jest.mock('models/helpCenter/queries', () => ({
    useCheckHelpCenterWithSubdomainExists: () => ({
        refetch: mockRefetch,
        isError: true,
    }),
}))

const store = mockStore({
    integrations: fromJS(integrationsState),
})

const defaultHelpCenter: HelpCenterCreationWizard = {
    name: 'My brand',
    subdomain: 'my-brand',
    defaultLocale: HELP_CENTER_DEFAULT_LOCALE,
    supportedLocales: [HELP_CENTER_DEFAULT_LOCALE],
    platformType: PlatformType.ECOMMERCE,
    stepName: HelpCenterCreationWizardStep.Basics,
    shopName: 'shop-test',
}

const storeIntegrations = [
    {
        name: 'shop-test',
        type: IntegrationType.Shopify,
    } as ShopifyIntegration,
]

const mockedHook = {
    helpCenter: defaultHelpCenter,
    allStoreIntegrations: storeIntegrations,
    updateData: mockUpdateData,
    onSave: mockOnSave,
    isLoading: false,
}

const queryClient = mockQueryClient()

const DefaultProviders: FC = ({children}) => (
    <QueryClientProvider client={queryClient}>
        <Provider store={store}>
            <Wizard steps={[HelpCenterCreationWizardStep.Basics]}>
                {children}
            </Wizard>
        </Provider>
    </QueryClientProvider>
)

describe('<HelpCenterCreationWizardStepBasics />', () => {
    beforeEach(() => {
        history.push = jest.fn()
        jest.useFakeTimers()
        mockUseHelpCenterCreationWizard.mockReturnValue(mockedHook)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders wizard with default options selected', async () => {
        const {findByTestId, getByRole, findByText, queryByText} =
            renderWithRouter(
                <DefaultProviders>
                    <HelpCenterCreationWizardStepBasics
                        isUpdate={false}
                        automateType={HelpCenterAutomateType.AUTOMATE}
                    />
                </DefaultProviders>
            )

        const brandInput = await findByTestId('name')
        const subdomainInput = getByRole('textbox', {
            name: /subdomain/i,
        }) as HTMLInputElement
        const defaultLanguageLabel = await findByText(/default language/i)
        const platformTypeLabel = queryByText(/platform type/i)

        expect(brandInput).toBeInTheDocument()
        expect(subdomainInput).toBeInTheDocument()
        expect(defaultLanguageLabel).toBeInTheDocument()
        expect(platformTypeLabel).not.toBeInTheDocument()
    })

    it('should trigger error at field level when action button is clicked', async () => {
        mockUseHelpCenterCreationWizard.mockReturnValue({
            ...mockedHook,
            helpCenter: {
                ...defaultHelpCenter,
                name: '',
            },
        })
        const {getByText, findAllByText} = renderWithRouter(
            <DefaultProviders>
                <HelpCenterCreationWizardStepBasics
                    isUpdate={false}
                    automateType={HelpCenterAutomateType.AUTOMATE}
                />
            </DefaultProviders>
        )

        fireEvent.click(getByText('Create & Customize', {selector: 'button'}))

        const errorMessages = await findAllByText('This field is required.')
        expect(errorMessages).toHaveLength(1)
    })

    it('should call onSave method when all fields are valid', () => {
        const {getByText} = renderWithRouter(
            <DefaultProviders>
                <HelpCenterCreationWizardStepBasics
                    isUpdate={false}
                    automateType={HelpCenterAutomateType.AUTOMATE}
                />
            </DefaultProviders>
        )

        fireEvent.click(getByText('Create & Customize', {selector: 'button'}))

        expect(mockOnSave).toHaveBeenCalledWith(
            NEXT_ACTION.NEW_WIZARD,
            HelpCenterCreationWizardStep.Branding
        )
    })

    it('should call updateData method when a field is updated', async () => {
        const {findByTestId} = renderWithRouter(
            <DefaultProviders>
                <HelpCenterCreationWizardStepBasics
                    isUpdate={false}
                    automateType={HelpCenterAutomateType.AUTOMATE}
                />
            </DefaultProviders>
        )
        const brandInput = await findByTestId('name')
        fireEvent.change(brandInput, {target: {value: 'updated name'}})

        expect(mockUpdateData).toHaveBeenCalledWith({
            name: 'updated name',
            subdomain: 'updated-name',
        })
    })

    it('should check subdomain when value is updated', async () => {
        const {getByRole} = renderWithRouter(
            <DefaultProviders>
                <HelpCenterCreationWizardStepBasics
                    isUpdate={false}
                    automateType={HelpCenterAutomateType.AUTOMATE}
                />
            </DefaultProviders>
        )

        const subdomainInput = getByRole('textbox', {
            name: /subdomain/i,
        }) as HTMLInputElement

        fireEvent.change(subdomainInput, {
            target: {value: 'custom-subdomain'},
        })

        await waitFor(() => {
            expect(mockRefetch).toHaveBeenCalled()
        })
    })
})
