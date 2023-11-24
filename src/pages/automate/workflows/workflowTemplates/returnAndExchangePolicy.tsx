import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
} from '../models/workflowConfiguration.types'
import {WAS_THIS_HELPFUL_WORKFLOW_ID} from '../constants'

export const RETURN_AND_EXCHANGE_POLICY: WorkflowTemplate = {
    slug: 'return-and-exchange-policy',
    name: 'Return and exchange policy',
    description: 'Provide return and exchange policies based on location.',
    getConfiguration: (
        id: string,
        account_id: number
    ): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Return and exchange policy',
            account_id,
            entrypoint: {
                label: `🔙 What's your return and exchange policy?`,
                label_tkey: ulid(),
            },
            initialMessage: {
                content: {
                    html: '<div>Our policies vary by location. Where are you located?</div>',
                    text: 'Our policies vary by location. Where are you located?',
                },
            },
        })
        b.insertChoicesStepAndSelect()
        b.insertChoiceAndMessagesStepAndSelect('US', [
            {
                content: {
                    html: '<div>We provide free returns and exchanges within 30 days for US customers.</div>',
                    text: 'We provide free returns and exchanges within 30 days for US customers.',
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessagesStepAndSelect('UK, Canada or Australia', [
            {
                content: {
                    html: `<div>For international returns or exchanges, we allow returns and exchanges within 30 days of receipt. At this time, customers are responsible for all international shipping costs.</div>`,
                    text: `For international returns or exchanges, we allow returns and exchanges within 30 days of receipt. At this time, customers are responsible for all international shipping costs.`,
                },
            },
        ])
        b.insertWorkflowCallStepAndSelect(WAS_THIS_HELPFUL_WORKFLOW_ID)
        return b.build()
    },
}
