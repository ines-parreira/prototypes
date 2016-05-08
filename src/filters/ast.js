import esprima from 'esprima'
import escodegen from 'escodegen'
import _ from 'lodash'

export function getAST(code) {
    if (!_.isString(code)) {
        console.error('Not a string:', code)
    }
    return esprima.parse(code)
}

export function getCode(ast) {
    if (!_.isString(ast.type)) {
        console.error('Not an AST:', ast)
    }
    return escodegen.generate(ast)
}
