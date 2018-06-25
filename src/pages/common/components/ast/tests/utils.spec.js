import {updateCodeAst} from '../utils'
import _schemas from '../../../../../fixtures/openapi'
import _astCodeContains from './fixtures/astCodeContains'
import _astCodeEq from './fixtures/astCodeEq'
import _astCodeNeq from './fixtures/astCodeNeq'
import {fromJS} from 'immutable'

const schemas = fromJS(_schemas)
const astCodeContains = fromJS(_astCodeContains)
const astCodeEq = fromJS(_astCodeEq)
const astCodeNeq = fromJS(_astCodeNeq)

describe('ast', () => {
    describe('utils', () => {
        describe('updateCodeAst', () => {
            describe('CallExpression changed', () => {
                describe('callee changed', () => {
                    it('should ONLY change callee and keep value (array value - from a collection operator to a collection operator)', () => {
                        // containsAll(ticket.subject, ['hello']) -> notContainsAll(ticket.subject, ['hello'])
                        const path = fromJS(['body', 0, 'test', 'callee', 'name'])
                        const newAst = updateCodeAst(schemas, astCodeContains, path, 'notContainsAll', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })

                    it('should ONLY change callee and keep value (integer value)', () => {
                        // eq(message.integration_id, 7) -> neq(message.integration_id, 7)
                        const path = fromJS(['body', 0, 'test', 'callee', 'name'])
                        const newAst = updateCodeAst(schemas, astCodeNeq, path, 'neq', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })

                    it('should ONLY change callee and keep value (from a string operator to a string operator)', () => {
                        // eq(ticket.subject, 'hello') -> neq(ticket.subject, 'hello')
                        const path = fromJS(['body', 0, 'test', 'callee', 'name'])
                        const newAst = updateCodeAst(schemas, astCodeEq, path, 'neq', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })

                    it('should change callee and reset value (changed from a collection operator to string operator)', () => {
                        // containsAll(ticket.subject, []) -> eq(ticket.subject, '')
                        const path = fromJS(['body', 0, 'test', 'callee', 'name'])
                        const newAst = updateCodeAst(schemas, astCodeContains, path, 'eq', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })

                    it('should change callee and reset value (from string operator to a collection operator)', () => {
                        // eq(ticket.subject, 'hello') -> containsAll(ticket.subject, [])
                        const path = fromJS(['body', 0, 'test', 'callee', 'name'])
                        const newAst = updateCodeAst(schemas, astCodeEq, path, 'containsAll', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })
                })

                describe('arguments changed', () => {
                    it('should update value (ArrayExpression value changed)', () => {
                        // containsAll(ticket.subject, ['hello']) -> containsAll(ticket.subject, ['hello', 'world'])
                        const path = fromJS(['body', 0, 'test', 'arguments', 1, 'elements'])
                        const elements = astCodeContains.getIn(path)
                        const newValue = elements.push({
                            type: 'Literal',
                            raw: '\'world\'',
                            value: 'world'
                        })
                        const newAst = updateCodeAst(schemas, astCodeContains, path, newValue, 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })

                    it('should update value (Literal value changed)', () => {
                        // eq(ticket.subject, 'hello') -> eq(ticket.subject, 'hello world!')
                        const path = fromJS(['body', 0, 'test', 'arguments', 1, 'value'])
                        const newAst = updateCodeAst(schemas, astCodeEq, path, 'hello world!', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })

                    it('should update property name and reset value (last attribute name changed)', () => {
                        // eq(ticket.subject, 'hello') -> eq(ticket.from_agent, true)
                        const path = fromJS(['body', 0, 'test', 'arguments', 0, 'property', 'name'])
                        const newAst = updateCodeAst(schemas, astCodeContains, path, 'from_agent', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })

                    it('should update property and reset value (middle attribute changed', () => {
                        // E.g: ticket.subject -> ticket.customer.email -> ticket.from_agent
                        let path = fromJS(['body', 0, 'test', 'arguments', 0, 'property', 'name'])
                        let newAst = updateCodeAst(schemas, astCodeEq, path, 'subject', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                        newAst = updateCodeAst(schemas, fromJS(newAst.ast), path, 'customer', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                        path = fromJS(['body', 0, 'test', 'arguments', 0, 'object', 'property', 'name'])
                        newAst = updateCodeAst(schemas, fromJS(newAst.ast), path, 'from_agent', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })

                    it('should update property and reset value (first attribute changed', () => {
                        // E.g: ticket.subject -> message.channel
                        const path = fromJS(['body', 0, 'test', 'arguments', 0, 'object', 'name'])
                        let newAst = updateCodeAst(schemas, astCodeContains, path, 'message', 'UPDATE')
                        expect(newAst).toMatchSnapshot()
                    })
                })

                describe('update if statement', () => {
                    it('should add else block to if statement', () => {
                        const baseAst = astCodeEq.deleteIn(['body', 0, 'alternate'])
                        const path = fromJS(['body', 0])
                        const value = {
                            alternate: {
                                type: 'BlockStatement',
                                body: []
                            }
                        }

                        let newAst = updateCodeAst(schemas, baseAst, path, value, 'UPDATE_IF_STATEMENT')
                        expect(newAst).toMatchSnapshot()
                    })
                })
            })
        })
    })
})
