import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import {render} from '@testing-library/react'

import {MacroEdit} from '../MacroEdit'

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
})
