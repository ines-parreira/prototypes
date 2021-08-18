import React, {useState} from 'react'
import {SyntheticEvent} from 'react-draft-wysiwyg'
import {connect, ConnectedProps} from 'react-redux'
import {useAsyncFn} from 'react-use'
import classnames from 'classnames'
import {Form, Button} from 'reactstrap'
import moment from 'moment'

import InputField from '../../../../common/forms/InputField'
import {RuleDraft, RuleLimitStatus} from '../../../../../state/rules/types'
import {getRulesLimitStatus} from '../../../../../state/entities/rules/selectors'
import {getAST, getCode} from '../../../../../utils'
import {createRule} from '../../../../../models/rule/resources'
import {ruleCreated} from '../../../../../state/entities/rules/actions'
import {notify} from '../../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../../state/notifications/types'
import {RootState} from '../../../../../state/types'

type OwnProps = {
    onSubmit: (id: number) => void
    onCancel: () => void
}

export function RuleFormContainer({
    limitStatus,
    ruleCreated,
    onSubmit,
    onCancel,
    notify,
}: OwnProps & ConnectedProps<typeof connector>) {
    const [name, _setName] = useState('')
    const [description, _setDescription] = useState('')
    const [isDirty, setIsDirty] = useState(false)

    const setName = (name: string) => {
        _setName(name)
        setIsDirty(true)
    }

    const setDescription = (description: string) => {
        _setDescription(description)
        setIsDirty(true)
    }

    const [{loading: isSubmitPending}, _handleSubmit] = useAsyncFn(
        async (rule: Partial<RuleDraft>) => {
            if (limitStatus !== RuleLimitStatus.Reached) {
                rule.event_types = 'ticket-created'
                rule.code = ''
                rule.code_ast = getAST(rule.code)
                rule.code = getCode(rule.code_ast)
                rule.deactivated_datetime = moment().format()
                try {
                    const createdRule = await createRule(rule as RuleDraft)
                    ruleCreated(createdRule)
                    onSubmit(createdRule.id)
                } catch (error) {
                    void notify({
                        message: 'Failed to create rule',
                        status: NotificationStatus.Error,
                    })
                }
            } else {
                void notify({
                    message:
                        'Your account has reached the rule limit. To add more rules, please delete any inactive rules.',
                    status: NotificationStatus.Error,
                })
                return Promise.reject()
            }
        }
    )

    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault()
        void _handleSubmit({name, description} as Partial<RuleDraft>)
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <div className="content">
                    <InputField
                        type="text"
                        name="name"
                        label="Name"
                        required
                        value={name}
                        onChange={setName}
                    />
                    <InputField
                        type="textarea"
                        name="description"
                        label="Description"
                        rows="3"
                        value={description}
                        onChange={setDescription}
                    />
                </div>
                <div className="actions float-right mt-3">
                    <Button
                        className="mr-2"
                        color="secondary"
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="primary"
                        className={classnames({
                            'btn-loading': isSubmitPending,
                        })}
                        disabled={isSubmitPending || !isDirty}
                    >
                        Create rule
                    </Button>
                </div>
            </Form>
        </div>
    )
}

const connector = connect(
    (state: RootState) => {
        return {
            limitStatus: getRulesLimitStatus(state),
        }
    },
    {
        ruleCreated,
        notify,
    }
)

export default connector(RuleFormContainer)
