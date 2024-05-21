import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'

import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import Property from 'pages/common/components/ast/Property'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const commonProps = {
    parent: fromJS(['body', 0, 'expression']),
    schemas: fromJS({foo: 'schemas'}),
    theKey: {foo: 'theKey'},
    value: {value: 'foo'},
} as unknown as ComponentProps<typeof Property>

describe('Property component', () => {
    it("should display errors if the validate method of the field's config raises any", () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <Property
                    {...commonProps}
                    config={{validate: () => 'error!error!'}}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it("should not display errors if the validate method of the field's config does not raise any", () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <Property
                    {...commonProps}
                    config={{validate: () => undefined}}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display errors if there is no validate method', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <Property {...commonProps} config={{}} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a compact (inline) Property', () => {
        const component = render(
            <Provider store={mockStore({})}>
                <Property {...commonProps} config={{}} compact={true} />
            </Provider>
        )

        expect(component).toMatchSnapshot()
    })
})
