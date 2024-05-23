import React from 'react'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'
import {fromJS} from 'immutable'
import {fireEvent, render} from '@testing-library/react'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import * as actions from 'state/integrations/actions'

import {GORGIAS_CHAT_DEFAULT_COLOR} from 'config/integrations/gorgias_chat'
import {GorgiasChatCreationWizardSteps} from 'models/integration/types'

import Wizard from 'pages/common/components/wizard/Wizard'

import GorgiasChatCreationWizardStepBranding from '../GorgiasChatCreationWizardStepBranding'

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false
)

const mockStore = configureMockStore([thunk])

const integration = fromJS({
    id: 1,
    name: 'Test Integration',
    decoration: {},
    meta: {
        language: 'en-US',
    },
})

const minProps: React.ComponentProps<
    typeof GorgiasChatCreationWizardStepBranding
> = {
    isSubmitting: false,
    integration,
}

describe('<GorgiasChatCreationWizardStepBranding />', () => {
    it('renders wizard with default options selected', () => {
        const {container, getByLabelText} = render(
            <MemoryRouter>
                <Provider store={mockStore({})}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBranding {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        container
            .querySelectorAll('.colorPicker input')
            .forEach((input) =>
                expect(input).toHaveValue(GORGIAS_CHAT_DEFAULT_COLOR)
            )

        expect(getByLabelText('Icon', {selector: 'input'})).toBeChecked()
    })

    it('submits form when fields have been changed', () => {
        const {container, getByRole, getByLabelText} = render(
            <MemoryRouter>
                <Provider store={mockStore({})}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBranding {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        fireEvent.change(container.querySelector('.colorPicker input')!, {
            target: {value: '#f00ba5'},
        })

        fireEvent.click(getByLabelText('Icon and label', {selector: 'input'}))

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', {name: 'Next'}))

        expect(spy.mock.calls).toMatchSnapshot()
    })

    it('disables buttons when submitting form', () => {
        const {getByRole} = render(
            <MemoryRouter>
                <Provider store={mockStore({})}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBranding
                            {...minProps}
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>
        )

        expect(
            getByRole('button', {name: 'Save & Customize Later'})
        ).toHaveClass('isDisabled')
        expect(getByRole('button', {name: 'Back'})).toHaveClass('isDisabled')
        expect(getByRole('button', {name: /Next/})).toHaveClass('isDisabled')
    })
})
