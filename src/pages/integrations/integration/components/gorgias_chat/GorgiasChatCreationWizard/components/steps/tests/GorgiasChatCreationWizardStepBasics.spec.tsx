import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import * as actions from 'state/integrations/actions'

import {GorgiasChatCreationWizardSteps} from 'models/integration/types'

import Wizard, {
    WizardContext,
    WizardContextState,
} from 'pages/common/components/wizard/Wizard'

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
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepBasics
> = {
    isUpdate: false,
    isSubmitting: false,
    integration: fromJS({}),
}

describe('<GorgiasChatCreationWizardStepBasics />', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders wizard with default options selected', () => {
        const {getByLabelText} = render(
            <Provider store={mockStore({})}>
                <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                    <GorgiasChatCreationWizardStepBasics {...minProps} />
                </Wizard>
            </Provider>
        )

        expect(
            getByLabelText('Ecommerce platforms', {selector: 'input'})
        ).toBeChecked()

        expect(
            getByLabelText('Allow live chat messages', {selector: 'input'})
        ).toBeChecked()
    })

    it('renders error for empty fields after submit attempt', () => {
        const {getByText, getAllByText} = render(
            <Provider store={mockStore({})}>
                <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                    <GorgiasChatCreationWizardStepBasics {...minProps} />
                </Wizard>
            </Provider>
        )

        fireEvent.click(getByText('Create & Customize', {selector: 'button'}))

        expect(getAllByText('This field is required.')).toHaveLength(2)
    })

    it('submits form with default values when creating chat', () => {
        const {getByText, getByLabelText} = render(
            <Provider store={mockStore({})}>
                <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                    <GorgiasChatCreationWizardStepBasics {...minProps} />
                </Wizard>
            </Provider>
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
            <Provider store={mockStore({})}>
                <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                    <GorgiasChatCreationWizardStepBasics
                        {...minProps}
                        integration={integration}
                        isUpdate
                    />
                </Wizard>
            </Provider>
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

    it('skips submitting form and navigates to next step when no fields have been changed', () => {
        const setActiveStepMock = jest.fn()

        const {getByText} = render(
            <Provider store={mockStore({})}>
                <WizardContext.Provider
                    value={
                        {
                            steps: [
                                GorgiasChatCreationWizardSteps.Basics,
                                'test',
                            ],
                            nextStep: 'test',
                            setActiveStep: setActiveStepMock,
                        } as unknown as WizardContextState
                    }
                >
                    <GorgiasChatCreationWizardStepBasics
                        {...minProps}
                        integration={integration}
                        isUpdate
                    />
                </WizardContext.Provider>
            </Provider>
        )

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByText('Next', {selector: 'button'}))

        expect(spy).not.toHaveBeenCalled()
        expect(setActiveStepMock).toHaveBeenCalledWith('test')
    })

    it('disables buttons when submitting create form', () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                    <GorgiasChatCreationWizardStepBasics
                        {...minProps}
                        isSubmitting
                    />
                </Wizard>
            </Provider>
        )

        expect(getByText('Cancel')).toHaveClass('isDisabled')
        expect(getByText('Create & Customize')).toHaveClass('isDisabled')
    })

    it('disables buttons when submitting update form', () => {
        const {getByText} = render(
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
        )

        expect(getByText('Save & Customize Later')).toHaveClass('isDisabled')
        expect(getByText('Next')).toHaveClass('isDisabled')
    })
})
