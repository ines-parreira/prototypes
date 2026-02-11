import type { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import type { RootState, StoreDispatch } from 'state/types'

import Property from '../Property'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const commonProps = {
    actions: {
        modifyCodeAST: jest.fn(),
        getCondition: jest.fn(),
    },
    config: {
        validate: jest.fn(),
    } as ComponentProps<typeof Property>['config'],
    parent: fromJS(['body', 0, 'expression']),
    properties: [],
    schemas: fromJS({ foo: 'schemas' }),
    value: { value: 'foo' },
    rule: fromJS({}),
}

const renderComponent = (props: Partial<ComponentProps<typeof Property>>) =>
    render(
        <Provider
            store={mockStore({ integrations: fromJS({ integrations: [] }) })}
        >
            <QueryClientProvider client={appQueryClient}>
                <Property {...commonProps} {...props} />
            </QueryClientProvider>
        </Provider>,
    )

describe('<Property />', () => {
    it("should display errors if the validate method of the field's config raises any", () => {
        renderComponent({
            config: {
                name: '',
                validate: (__, ___) =>
                    'One or multiple email addresses are invalid',
            },
        })

        expect(
            screen.getByText('One or multiple email addresses are invalid'),
        ).toBeInTheDocument()
    })

    it("should not display errors if the validate method of the field's config does not raise any", () => {
        const { container } = renderComponent({
            config: {
                name: '',
                validate: () => undefined,
            },
        })

        expect(container.firstChild?.textContent).toBe('')
    })

    it('should not display errors if there is no validate method', () => {
        const { container } = renderComponent({
            config: {},
        })

        expect(container.firstChild?.textContent).toBe('')
    })

    it('should render a compact (inline) Property', () => {
        const { container } = renderComponent({
            config: {},
            compact: true,
        })

        expect((container.firstChild as HTMLElement).classList).toContain(
            'd-flex',
        )
    })
})
