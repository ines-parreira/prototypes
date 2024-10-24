import {render, screen} from '@testing-library/react'
import {fromJS, List} from 'immutable'
import React from 'react'

import {RuleItemActions} from 'pages/settings/rules/types'

import ObjectExpression from '../ObjectExpression'

jest.mock(
    'pages/common/components/ast/Property',
    () =>
        ({
            leftsiblings,
            parent,
        }: {
            leftsiblings?: List<any>
            parent: List<any>
        }) => (
            <div>
                PropertyMock: {JSON.stringify(leftsiblings?.toJS())}
                {JSON.stringify(parent?.toJS())}
            </div>
        )
)

const commonProps = {
    actions: {} as RuleItemActions,
    config: {
        compact: false,
        name: 'Send email',
    },
    leftsiblings: fromJS([]),
    parent: fromJS([]),
    properties: [
        {
            type: 'Property' as const,
            key: {
                type: 'Identifier' as const,
                name: 'new property',
            },
            computed: false,
            value: {
                type: 'Literal' as const,
                value: 'value property',
                raw: 'value property',
            },
            kind: 'init' as const,
            method: false,
            shorthand: false,
        },
    ],
    rule: fromJS({}),
    schemas: fromJS({}),
}

describe('<ObjectExpression />', () => {
    it('should render Property child', () => {
        render(<ObjectExpression {...commonProps} />)

        expect(screen.getByText(/PropertyMock:/)).toBeInTheDocument()
        expect(screen.getByText(/["new property"]/)).toBeInTheDocument()
        expect(screen.getByText(/["properties", 0]/)).toBeInTheDocument()
    })

    it('should not render when property config specifies it', () => {
        render(
            <ObjectExpression
                {...commonProps}
                config={{
                    compact: false,
                    name: 'Send email',
                    args: {body_text: {hide: true}},
                }}
                properties={[
                    {
                        type: 'Property' as const,
                        key: {
                            type: 'Identifier' as const,
                            name: 'body_text',
                        },
                        computed: false,
                        value: {
                            type: 'Literal' as const,
                            value: 'value property',
                            raw: 'value property',
                        },
                        kind: 'init' as const,
                        method: false,
                        shorthand: false,
                    },
                ]}
            />
        )

        expect(screen.queryByText(/PropertyMock:/)).not.toBeInTheDocument()
    })
})
