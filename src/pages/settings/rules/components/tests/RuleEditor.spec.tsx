import React from 'react'
import _getIn from 'lodash/get'
import _noop from 'lodash/noop'
import {render} from '@testing-library/react'
import {Map, fromJS, List} from 'immutable'

import {RuleDraft} from '../../../../../models/rule/types'
import {emptyRule as rule} from '../../../../../fixtures/rule'
import RuleEditor from '../RuleEditor'
import {CodeASTType} from '../../types'

const getCondition = (path: List<any>) =>
    fromJS(_getIn(rule, ['code_ast', ...path.toJS()])) as Map<any, any>

describe('<RuleEditor/>', () => {
    describe('render', () => {
        it('should render the  editor', () => {
            const {container} = render(
                <RuleEditor
                    ruleDraft={rule as RuleDraft}
                    actions={{
                        modifyCodeAST: (path, node, operation, code_ast) => {
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
