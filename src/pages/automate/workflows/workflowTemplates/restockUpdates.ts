import {ulid} from 'ulidx'
import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const RESTOCK_UPDATES: WorkflowTemplate = {
    slug: 'restock-updates',
    name: 'Restock updates',
    description:
        'Let customers know when to expect restocks and how they can stay informed of updates.',
    label: WorkflowTemplateLabelType.ProductQuestion,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Restock updates',
            entrypoint: {
                label: '💪 How often do you restock?',
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'message',
                settings: {
                    message: {
                        content: {
                            html: '<div>We restock every [<strong>frequency Example: 10 days, 3 months</strong>].</div><div>Subscribe to our newsletter [<strong>link</strong>] and follow us on [<strong>link to social media</strong>] to get updated on restocks and product availability.</div>',
                            text: `We restock every [frequency Example: 10 days, 3 months].
Subscribe to our newsletter [link] and follow us on [link to social media] to get updated on restocks and product availability.`,
                        },
                    },
                },
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
