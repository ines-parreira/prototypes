import type React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    GORGIAS_CHAT_DEFAULT_COLOR_REVAMP,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
} from 'config/integrations/gorgias_chat'
import {
    GorgiasChatCreationWizardSteps,
    IntegrationType,
} from 'models/integration/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import * as actions from 'state/integrations/actions'

import GorgiasChatCreationWizardStepBranding from '../GorgiasChatCreationWizardStepBranding'

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
}

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
        const { container } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBranding {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        container
            .querySelectorAll('.colorPicker input')
            .forEach((input) =>
                expect(input).toHaveValue(GORGIAS_CHAT_DEFAULT_COLOR_REVAMP),
            )

        expect(screen.getByText('Launcher position')).toBeInTheDocument()
        expect(screen.getByText('Home page logo')).toBeInTheDocument()
    })

    it('submits form when fields have been changed', () => {
        const { container, getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBranding {...minProps} />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        fireEvent.change(container.querySelector('.colorPicker input')!, {
            target: { value: '#f00ba5' },
        })

        const spy = jest.spyOn(actions, 'updateOrCreateIntegration')

        fireEvent.click(getByRole('button', { name: 'Continue' }))

        expect(spy).toHaveBeenCalledTimes(1)

        const [formData, , silentUpdate, , goToNextStep, successMessage] =
            spy.mock.calls[0]
        const form = (formData as Map<string, unknown>).toJS()

        expect(form.type).toBe(IntegrationType.GorgiasChat)
        expect(form.id).toBe(1)
        expect(form.decoration.main_color).toBe('#f00ba5')
        expect(form.decoration.conversation_color).toBe('#f00ba5')
        expect(form.decoration.position).toEqual(
            GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
        )
        expect(form.meta.wizard.step).toBe(
            GorgiasChatCreationWizardSteps.Automate,
        )
        expect(silentUpdate).toBe(true)
        expect(goToNextStep).toBe(true)
        expect(successMessage).toBe('Changes saved')
    })

    it('disables buttons when submitting form', () => {
        const { getByRole } = render(
            <MemoryRouter>
                <Provider store={mockStore(mockStoreState)}>
                    <Wizard steps={[GorgiasChatCreationWizardSteps.Basics]}>
                        <GorgiasChatCreationWizardStepBranding
                            {...minProps}
                            isSubmitting
                        />
                    </Wizard>
                </Provider>
            </MemoryRouter>,
        )

        expect(
            getByRole('button', { name: 'Save and Exit' }),
        ).toBeAriaDisabled()
        expect(getByRole('button', { name: 'Back' })).toBeAriaDisabled()
        expect(getByRole('button', { name: /Continue/ })).toBeAriaDisabled()
    })
})
