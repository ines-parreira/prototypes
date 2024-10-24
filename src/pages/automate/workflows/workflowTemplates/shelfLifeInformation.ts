import {ulid} from 'ulidx'

import {WorkflowConfigurationBuilder} from '../models/workflowConfiguration.model'
import {
    WorkflowConfiguration,
    WorkflowTemplate,
    WorkflowTemplateLabelType,
} from '../models/workflowConfiguration.types'

export const SHELF_LIFE_INFORMATION: WorkflowTemplate = {
    slug: 'shelf-life-information',
    name: 'Shelf life information',
    description: 'Provide guidance around the shelf life of your products.',
    label: WorkflowTemplateLabelType.ProductQuestion,
    getConfiguration: (id: string): WorkflowConfiguration => {
        const b = new WorkflowConfigurationBuilder({
            id,
            name: 'Shelf life information',
            entrypoint: {
                label: "🌱 What's your products' shelf life?",
                label_tkey: ulid(),
            },
            initialStep: {
                id: ulid(),
                kind: 'choices',
                settings: {
                    message: {
                        content: {
                            html: '<div>Select one of our product lines.</div>',
                            text: 'Select one of our product lines.',
                        },
                    },
                    choices: [],
                },
            },
        })
        b.insertChoiceAndMessageStepAndSelect('Soaps', {
            content: {
                html: '<div>You can expect our soaps to have a 2-year shelf life from the moment you purchased them.</div>',
                text: 'You can expect our soaps to have a 2-year shelf life from the moment you purchased them.',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Hair care', {
            content: {
                html: '<div>You can expect our soaps to have a 2-year shelf life from the moment you purchased them.</div>',
                text: 'You can expect our soaps to have a 2-year shelf life from the moment you purchased them.',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        b.selectParentStep()
        b.selectParentStep()
        b.insertChoiceAndMessageStepAndSelect('Lotions', {
            content: {
                html: '<div>You can expect our lotions to have a 1-year shelf life from the moment you purchased them.</div>',
                text: 'You can expect our lotions to have a 1-year shelf life from the moment you purchased them.',
            },
        })
        b.insertHelpfulPromptStepAndSelect()
        return b.build()
    },
}
