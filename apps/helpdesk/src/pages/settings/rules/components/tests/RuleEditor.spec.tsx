import React from 'react'

import { render } from '@repo/testing'
import type { List, Map } from 'immutable'
import { get as getIn, noop } from '@gorgias/toolkit'
import { fromAST } from 'common/utils'

import { emptyRule as rule } from '../../../../../fixtures/rule'
import type { RuleDraft } from '../../../../../models/rule/types'
import type { CodeASTType } from '../../types'
import { RuleEditor } from '../RuleEditor'

const getCondition = (path: List<any>) =>
    fromAST(getIn(rule, ['code_ast', ...path.toJS()])) as Map<any, any>

describe('<RuleEditor/>', () => {
    describe('render', () => {
        it('should render the  editor', () => {
            const { container } = render(
                <RuleEditor
                    ruleDraft={rule as RuleDraft}
                    actions={{
                        modifyCodeAST: (_path, _node, _operation, code_ast) => {
                            return code_ast as CodeASTType
                        },
                        getCondition,
                    }}
                    handleEventChanges={noop}
                />,
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
