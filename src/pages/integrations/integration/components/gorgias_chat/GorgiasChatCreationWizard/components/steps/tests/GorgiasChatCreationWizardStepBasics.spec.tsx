import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import * as actions from 'state/integrations/actions'

import {
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'

import Wizard from 'pages/common/components/wizard/Wizard'

import GorgiasChatCreationWizardStepBasics from '../GorgiasChatCreationWizardStepBasics'

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false
)

const mockStore = configureMockStore([thunk])

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    meta: {shop_integration_id: 1},
    decoration: {},
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepBasics
> = {
    isUpdate: false,
    isSubmitting: false,
    integration: fromJS({}),
}

describe('<GorgiasChatCreationWizardStepBasics />', () => {
    it('renders wizard with default options selected', () => {
        const {getByLabelText} = render(
            <MemoryRouter>
                <Provider
                    store={mockStore({
                        integrations: fromJS({
                            integrations: [
                                {
                                    id: 1,
                                    type: IntegrationType.Shopify,
                                },
                            ],
                        }),
                    })}
                >
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        expect(
            getByLabelText('Ecommerce platforms', {selector: 'input'})
        ).toBeChecked()

        expect(
            getByLabelText('Allow live chat messages', {selector: 'input'})
        ).toBeChecked()
    })

    it('renders error for empty fields after submit attempt', () => {
        const {getByText, getByLabelText, getAllByText} = render(
            <MemoryRouter>
                <Provider store={mockStore({})}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        fireEvent.click(getByText('Create & Customize', {selector: 'button'}))

        expect(getAllByText('This field is required.')).toHaveLength(2)

        fireEvent.click(
            getByLabelText('Ecommerce platforms', {selector: 'input'})
        )

        expect(
            getByLabelText('Ecommerce platforms', {selector: 'input'})
        ).toBeChecked()

        fireEvent.click(getByText('Create & Customize', {selector: 'button'}))

        expect(getAllByText('This field is required.')).toHaveLength(2)
    })

    it('submits form with default values when creating chat', () => {
        const {getByText, getByLabelText} = render(
            <MemoryRouter>
                <Provider store={mockStore({})}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        fireEvent.change(getByLabelText('Chat title*', {selector: 'input'}), {
            target: {value: 'Test Chat Title'},
        })

        fireEvent.click(
            getByLabelText('Any other website', {selector: 'input'})
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByText('Create & Customize', {selector: 'button'}))

        expect(spy.mock.calls).toMatchSnapshot()
    })

    it('submits form when updating chat', () => {
        const {getByText, getByLabelText} = render(
            <MemoryRouter>
                <Provider store={mockStore({})}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integration}
                            isUpdate
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        fireEvent.change(getByLabelText('Chat title*', {selector: 'input'}), {
            target: {value: 'Test Chat Title'},
        })

        fireEvent.click(
            getByLabelText('Any other website', {selector: 'input'})
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByText('Next', {selector: 'button'}))

        expect(spy.mock.calls).toMatchSnapshot()
    })

    it('disables buttons when submitting create form', () => {
        const {getByText} = render(
            <MemoryRouter>
                <Provider store={mockStore({})}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        expect(getByText('Cancel')).toHaveClass('isDisabled')
        expect(getByText('Create & Customize')).toHaveClass('isDisabled')
    })

    it('disables buttons when submitting update form', () => {
        const {getByText} = render(
            <MemoryRouter>
                <Provider store={mockStore({})}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBasics
                            {...minProps}
                            integration={integration}
                            isUpdate
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        expect(getByText('Save & Customize Later')).toHaveClass('isDisabled')
        expect(getByText('Next')).toHaveClass('isDisabled')
    })
})
