import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import {render} from '@testing-library/react'

import {MacroActionName} from 'models/macroAction/types'

import {MacroEdit} from '../MacroEdit'

const mockStore = configureMockStore([thunk])

// To avoid snapshoting all languages
jest.mock('constants/languages', () => {
    const module: Record<string, unknown> = jest.requireActual(
        'constants/languages'
    )
    return {
        ...module,
        ISO639English: {
            aa: 'Afar',
            ab: 'Abkhazian',
        },
    }
})

jest.mock(
    'pages/tickets/common/macros/components/actions/SetResponseTextAction',
    () => () => <>SetResponseTextAction</>
)

const setResponseTextAction = {
    type: 'user',
    execution: 'front',
    name: MacroActionName.SetResponseText,
    title: 'Add forward by email',
    arguments: {
        body_text: '',
        body_html: '',
        cc: 'test@gorgias.com',
        bcc: 'test@gorgias.com',
        from: 'test@gorgias.com',
    },
}

describe('MacroEdit component', () => {
    const defaultProps = {
        actions: fromJS([]),
        agents: fromJS({}),
        currentMacro: fromJS({id: 1}),
        hasIntegrationOfTypes: _noop,
        name: 'Pizza Pepperoni',
        setActions: _noop,
        setName: _noop,
    } as any as ComponentProps<typeof MacroEdit>

    it('should render the macro edit form', () => {
        const {container} = render(<MacroEdit {...defaultProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should change name input value', () => {
        const {getByDisplayValue} = render(
            <MacroEdit {...defaultProps} name="Pizza Capricciosa" />
        )

        expect(getByDisplayValue('Pizza Capricciosa'))
    })

    it('should convert setResponseText to addInternalNote', () => {
        const setActions = jest.fn()

        const {queryByText} = render(
            <Provider store={mockStore({})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([
                        {
                            ...setResponseTextAction,
                            arguments: {
                                ...setResponseTextAction.arguments,
                                body_text: 'test body',
                                body_html: 'test body',
                            },
                        },
                    ])}
                    setActions={setActions}
                />
            </Provider>
        )

        expect(queryByText('SetResponseTextAction')).toBeTruthy()
    })
})
