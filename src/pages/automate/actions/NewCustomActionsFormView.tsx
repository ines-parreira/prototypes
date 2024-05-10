import React from 'react'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {ulid} from 'ulidx'
import {useParams, Link} from 'react-router-dom'
import AutomateView from 'pages/automate/common/components/AutomateView'
import {ACTIONS} from '../common/components/constants'
import {CustomActionConfigurationFormInput} from './types'
import CustomActionsForm from './components/CustomActionsForm'
import css from './ActionsView.less'

const httpStepId = ulid()
const httpStepVariableId = ulid()

export default function ActionView() {
    const INITIAL_CUSTOM_ACTIONS_VALUES: CustomActionConfigurationFormInput = {
        name: '',
        id: ulid(),
        initial_step_id: httpStepId,
        is_draft: false,
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: '',
                    requires_confirmation: false,
                },
                deactivated_datetime: null,
            },
        ],
        triggers: [
            {
                kind: 'llm-prompt',
                settings: {
                    custom_inputs: [
                        {
                            data_type: 'string',
                            id: ulid(),
                            name: '',
                            instructions: '',
                        },
                    ],
                    object_inputs: [],
                    outputs: [
                        {
                            description: '',
                            id: ulid(),
                            path: `steps_state.${httpStepId}.content.${httpStepVariableId}`,
                        },
                    ],
                },
            },
        ],
        steps: [
            {
                id: httpStepId,
                kind: 'http-request',
                settings: {
                    url: '',
                    method: 'GET',
                    headers: {},
                    name: '',
                    variables: [
                        {
                            id: httpStepVariableId,
                            name: 'Request result',
                            jsonpath: '$',
                            data_type: null as any,
                        },
                    ],
                },
            },
        ],
        transitions: [],
        available_languages: [],
        updated_datetime: new Date().toISOString(),
    }

    const {shopName, shopType} = useParams<{
        shopType: string
        shopName: string
    }>()

    return (
        <AutomateView
            className={css.actionsFormContainer}
            title={
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link
                            to={`/app/automation/${shopType}/${shopName}/actions`}
                        >
                            {ACTIONS}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>New Action</BreadcrumbItem>
                </Breadcrumb>
            }
        >
            <CustomActionsForm
                initialConfigurationData={INITIAL_CUSTOM_ACTIONS_VALUES}
            />
        </AutomateView>
    )
}
