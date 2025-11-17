import type { ComponentProps } from 'react'
import React from 'react'

import classnames from 'classnames'
import { FormGroup } from 'reactstrap'

import { fromAST } from 'common/utils'

import type { RuleDraft } from '../../../../state/rules/types'
import Program from '../../../common/components/ast/Program'
import type { RuleItemActions } from '../types'
import { RulesTriggerSelect } from './RulesTriggerSelect'

import css from './RuleEditor.less'

type Props = {
    ruleDraft: RuleDraft
    actions: RuleItemActions
    className?: string
    handleEventChanges: (event_types: string) => void
}

function RuleEditor({
    ruleDraft,
    handleEventChanges,
    actions,
    className,
}: Props) {
    return (
        <FormGroup
            className={classnames(className, css.ruleContainer)}
            id="ruleContainer"
        >
            <RulesTriggerSelect
                rule={ruleDraft}
                setEventTypes={handleEventChanges}
            />
            <Program
                body={
                    ruleDraft.code_ast.body as ComponentProps<
                        typeof Program
                    >['body']
                }
                rule={fromAST(ruleDraft)}
                actions={actions}
            />
        </FormGroup>
    )
}

export default RuleEditor
