import React from 'react'
import {fromJS} from 'immutable'

import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import Property from 'pages/common/components/ast/Property'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const commonProps = {
    actions: {
        modifyCodeAST: jest.fn(),
        getCondition: jest.fn(),
    },
    config: {
        validate: () => {},
    },
    parent: fromJS(['body', 0, 'expression']),
    properties: [],
    schemas: fromJS({foo: 'schemas'}),
    value: {value: 'foo'},
    rule: fromJS({}),
}

describe('<Property />', () => {
    it("should display errors if the validate method of the field's config raises any", () => {
        render(
            <Provider store={mockStore({})}>
                <Property
                    {...commonProps}
                    config={{
                        name: '',
                        validate: (__, ___) =>
                            'One or multiple email addresses are invalid',
                    }}
                />
            </Provider>
        )

        expect(
            screen.getByText('One or multiple email addresses are invalid')
        ).toBeInTheDocument()
    })

    it("should not display errors if the validate method of the field's config does not raise any", () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <Property
                    {...commonProps}
                    config={{name: '', validate: () => undefined}}
                />
            </Provider>
        )

        expect(container.firstChild?.textContent).toBe('')
    })

    it('should not display errors if there is no validate method', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <Property {...commonProps} config={{}} />
            </Provider>
        )

        expect(container.firstChild?.textContent).toBe('')
    })

    it('should render a compact (inline) Property', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <Property {...commonProps} config={{}} compact={true} />
            </Provider>
        )

        expect((container.firstChild as HTMLElement).classList).toContain(
            'd-flex'
        )
    })
})
