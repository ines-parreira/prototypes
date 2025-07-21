import { ComponentType } from 'react'

import { render, screen } from '@testing-library/react'

import {
    ExpressionProps,
    RuleContext,
    StatementProps,
} from '../rule/RuleProvider'
import { useRuleContext } from '../useRuleContext'

const MockExpression: ComponentType = () => <div>Mock Expression</div>
const MockStatement: ComponentType = () => <div>Mock Statement</div>

describe('RuleContext', () => {
    it('provides and consumes context values correctly', () => {
        const ContextConsumer = () => {
            const { Expression, Statement } = useRuleContext()

            return (
                <div>
                    <span>Using Expression:</span>
                    <Expression {...({} as ExpressionProps)} />
                    <span>Using Statement:</span>
                    <Statement {...({} as StatementProps)} />
                </div>
            )
        }

        render(
            <RuleContext.Provider
                value={{ Expression: MockExpression, Statement: MockStatement }}
            >
                <ContextConsumer />
            </RuleContext.Provider>,
        )

        expect(screen.getByText('Using Expression:')).toBeInTheDocument()
        expect(screen.getByText('Mock Expression')).toBeInTheDocument()

        expect(screen.getByText('Using Statement:')).toBeInTheDocument()
        expect(screen.getByText('Mock Statement')).toBeInTheDocument()
    })
})
