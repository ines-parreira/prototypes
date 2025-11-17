import { ulid } from 'ulidx'

import { WorkflowConfigurationBuilder } from '../models/workflowConfiguration.model'
import type {
    WorkflowConfiguration,
    WorkflowTemplate,
} from '../models/workflowConfiguration.types'
import { WorkflowTemplateLabelType } from '../models/workflowConfiguration.types'

export const PRODUCT_RECOMMENDATION: WorkflowTemplate = {
    slug: 'product-recommendation',
    name: 'Product recommendation',
    description:
        'Ask customers questions and recommend specific products based on their answers.',
    label: WorkflowTemplateLabelType.ProductQuestion,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Product recommendation',
            entrypoint: {
                label: 'What shoe is right for me?',
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'choices',
                settings: {
                    choices: [],
                    message: {
                        content: {
                            html: 'How much cushion are you looking for?',
                            text: 'How much cushion are you looking for?',
                        },
                    },
                },
            },
        })
        b.insertChoiceAndChoicesStepAndSelect('Light cushion', {
            content: {
                html: 'Where are you planning to use them most?',
                text: 'Where are you planning to use them most?',
            },
        })
        b.insertChoiceAndMessageStepAndSelect('Outdoors', {
            content: {
                html: 'We recommend you go with shoe A',
                text: 'We recommend you go with shoe A',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Indoors', {
            content: {
                html: 'We recommend you go with shoe B',
                text: 'We recommend you go with shoe B',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndChoicesStepAndSelect('Medium cushion', {
            content: {
                html: 'What kinds of activities will you be doing?',
                text: 'What kinds of activities will you be doing?',
            },
        })
        b.insertChoiceAndMessageStepAndSelect('Running', {
            content: {
                html: 'We recommend you go with shoe C',
                text: 'We recommend you go with shoe C',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Cross-training', {
            content: {
                html: 'We recommend you go with shoe D',
                text: 'We recommend you go with shoe D',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
