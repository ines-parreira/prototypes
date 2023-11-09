import {expressionReference} from '../expression/expressionReference'
import Expression from '../expression/Expression'
import {statementReference} from '../statements/statementReference'
import Statement from '../statements/Statement'

import '../Program'

describe('Program', () => {
    it('should set the expression reference', () => {
        expect(expressionReference.Expression).toBe(Expression)
    })

    it('should set the statement reference', () => {
        expect(statementReference.Statement).toBe(Statement)
    })
})
