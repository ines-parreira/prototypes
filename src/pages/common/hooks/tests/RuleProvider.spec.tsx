import React, {ComponentType} from 'react'
import {render, screen} from '@testing-library/react'
import {
    ExpressionProps,
    StatementProps,
    RuleContext,
} from '../rule/RuleProvider'
import {useRuleContext} from '../useRuleContext'

const MockExpression: ComponentType = () => <div>Mock Expression</div>
const MockStatement: ComponentType = () => <div>Mock Statement</div>

describe('RuleContext', () => {
    it('provides and consumes context values correctly', () => {
        const ContextConsumer = () => {
            const {Expression, Statement} = useRuleContext()

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
                value={{Expression: MockExpression, Statement: MockStatement}}
            >
                <ContextConsumer />
            </RuleContext.Provider>
        )

        expect(screen.getByText('Using Expression:')).toBeInTheDocument()
        expect(screen.getByText('Mock Expression')).toBeInTheDocument()

        expect(screen.getByText('Using Statement:')).toBeInTheDocument()
        expect(screen.getByText('Mock Statement')).toBeInTheDocument()
    })

    it('throws an error if used outside a provider', () => {
        const ConsumerWithoutProvider = () => {
            try {
                useRuleContext()
            } catch (err: unknown) {
                return <div>{(err as Error).message}</div>
            }

            return <></>
        }

        render(<ConsumerWithoutProvider />)

        expect(
            screen.getByText(
                'useRuleContext must be used within a RuleContext.Provider'
            )
        ).toBeInTheDocument()
    })
})
