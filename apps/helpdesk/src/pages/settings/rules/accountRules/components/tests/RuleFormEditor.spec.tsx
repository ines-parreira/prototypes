import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { fromJS } from 'immutable'

import { emptyRule as ruleFixture } from 'fixtures/rule'

import { RuleFormEditor } from '../RuleFormEditor'

describe('<RuleFormEditor />', () => {
    const minProps: ComponentProps<typeof RuleFormEditor> = {
        rule: ruleFixture,
    }
    const renderComponent = (props: ComponentProps<typeof RuleFormEditor>) =>
        render(<RuleFormEditor {...props} />, {
            storeState: {
                currentUser: fromJS({
                    role: {
                        name: 'agent',
                    },
                }),
                entities: {
                    rules: {},
                },
            },
        })

    it('should render editor for rule', () => {
        const { baseElement } = renderComponent(minProps)
        expect(baseElement.firstChild).toMatchSnapshot()
    })
    it('should render editor for creating rule', () => {
        const props = {
            ...minProps,
            rule: undefined,
        }
        const { baseElement } = renderComponent(props)
        expect(baseElement.firstChild).toMatchSnapshot()
    })
})
