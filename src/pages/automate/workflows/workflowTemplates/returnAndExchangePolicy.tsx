import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const RETURN_AND_EXCHANGE_POLICY: WorkflowTemplate = {
    slug: 'return-and-exchange-policy',
    name: 'Return and exchange policy',
    description: 'Provide return and exchange policies based on location.',
    label: WorkflowTemplateLabelType.Policies,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Return and exchange policy',
            entrypoint: {
                label: `🔙 What's your return and exchange policy?`,
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'choices',
                settings: {
                    choices: [],
                    message: {
                        content: {
                            html: '<div>Our policies vary by location. Where are you located?</div>',
                            text: 'Our policies vary by location. Where are you located?',
                        },
                    },
                },
            },
        })
        b.insertChoiceAndMessageStepAndSelect('US', {
            content: {
                html: '<div>We provide free returns and exchanges within 30 days for US customers.</div>',
                text: 'We provide free returns and exchanges within 30 days for US customers.',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('UK, Canada or Australia', {
            content: {
                html: `<div>For international returns or exchanges, we allow returns and exchanges within 30 days of receipt. At this time, customers are responsible for all international shipping costs.</div>`,
                text: `For international returns or exchanges, we allow returns and exchanges within 30 days of receipt. At this time, customers are responsible for all international shipping costs.`,
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
