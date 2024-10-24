import {render} from '@testing-library/react'
import {Map, List} from 'immutable'
import _getIn from 'lodash/get'
import _noop from 'lodash/noop'
import React from 'react'

import {fromAST} from 'common/utils'

import {emptyRule as rule} from '../../../../../fixtures/rule'
import {RuleDraft} from '../../../../../models/rule/types'
import {CodeASTType} from '../../types'
import RuleEditor from '../RuleEditor'

const getCondition = (path: List<any>) =>
    fromAST(_getIn(rule, ['code_ast', ...path.toJS()])) as Map<any, any>

describe('<RuleEditor/>', () => {
    describe('render', () => {
        it('should render the  editor', () => {
            const {container} = render(
                <RuleEditor
                    ruleDraft={rule as RuleDraft}
                    actions={{
                        modifyCodeAST: (_path, _node, _operation, code_ast) => {
                            return code_ast as CodeASTType
                        },
                        getCondition,
                    }}
                    handleEventChanges={_noop}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
