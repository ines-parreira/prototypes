import classnames from 'classnames'
import React, {ComponentProps} from 'react'
import {FormGroup} from 'reactstrap'

import {fromAST} from 'common/utils'

import {RuleDraft} from '../../../../state/rules/types'
import Program from '../../../common/components/ast/Program'
import {RuleItemActions} from '../types'

import css from './RuleEditor.less'
import {RulesTriggerSelect} from './RulesTriggerSelect'

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
