import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import * as actions from 'state/integrations/actions'

import GorgiasChatCreationWizardStepBasics from '../GorgiasChatCreationWizardStepBasics'

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false,
)

const mockStore = configureMockStore([thunk])

const mockStoreState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    agents: fromJS({
        all: [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                role: { name: 'admin' },
            },
            {
                id: 2,
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: { name: 'agent' },
            },
        ],
    }),
    integrations: fromJS({
        integrations: [],
    }),
}

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    meta: {
        shop_integration_id: 1,
        language: 'en-US',
        meta: { oauth: { scope: ['read_script_tags', 'write_script_tags'] } },
    },
    decoration: {},
    type: IntegrationType.Shopify,
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepBasics
> = {
    isUpdate: false,
    isSubmitting: false,
    integration: fromJS({}),
}

describe('<GorgiasChatCreationWizardStepBasics />', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    it('renders wizard with default options selected', () => {
        const { getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByLabelText('Ecommerce platforms', { selector: 'input' }),
        ).toBeChecked()

        expect(
            getByLabelText('Allow live chat messages', { selector: 'input' }),
        ).toBeChecked()
    })

    it('renders error for empty fields after submit attempt', () => {
        const { getByLabelText, getAllByText, getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.click(getByRole('button', { name: 'Create & Customize' }))

        expect(getAllByText('This field is required.')).toHaveLength(2)

        fireEvent.click(
            getByLabelText('Ecommerce platforms', { selector: 'input' }),
        )

        expect(
            getByLabelText('Ecommerce platforms', { selector: 'input' }),
        ).toBeChecked()

        fireEvent.click(getByRole('button', { name: 'Create & Customize' }))

        expect(getAllByText('This field is required.')).toHaveLength(2)
    })

    it('submits form with default values when creating chat', () => {
        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat Title' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Create & Customize' }))

        expect(spy.mock.calls).toMatchSnapshot()
    })

    it('submits form when updating chat', () => {
        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integration}
                            isUpdate
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat Title' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Next' }))

        expect(spy.mock.calls).toMatchSnapshot()
    })

    it('disables buttons when submitting create form', () => {
        const { getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(getByRole('button', { name: 'Cancel' })).toBeAriaDisabled()
        expect(
            getByRole('button', { name: /Create & Customize/ }),
        ).toBeAriaDisabled()
    })

    it('disables buttons when submitting update form', () => {
        const { getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integration}
                            isUpdate
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByRole('button', { name: 'Save & Customize Later' }),
        ).toBeAriaDisabled()
        expect(getByRole('button', { name: /Next/ })).toBeAriaDisabled()
    })

    it('should include languages when creating chat', () => {
        mockUseFlag.mockReturnValue(true)
        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat Title' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Create & Customize' }))

        expect(spy.mock.calls).toMatchSnapshot()
    })

    it('should include languages when updating chat', () => {
        mockUseFlag.mockReturnValue(true)

        const { getByRole, getByLabelText } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integration}
                            isUpdate
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(getByLabelText('Chat title*', { selector: 'input' }), {
            target: { value: 'Test Chat Title' },
        })

        fireEvent.click(
            getByLabelText('Any other website', { selector: 'input' }),
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Next' }))

        expect(spy.mock.calls).toMatchSnapshot()
    })
})
