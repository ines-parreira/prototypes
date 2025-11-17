import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'
import { ulid } from 'ulidx'

import type { ActionTemplate } from 'pages/automate/actionsPlatform/types'
import { WorkflowConfigurationBuilder } from 'pages/automate/workflows/models/workflowConfiguration.model'

import UseCaseTemplateCard from '../UseCaseTemplateCard'

jest.mock('../UseCaseTemplateModal', () => {
    return ({ onClose }: { onClose: () => void }) => (
        <div onClick={onClose}>UseCaseTemplateModal</div>
    )
})

const b = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: 'template name',
    initialStep: {
        id: ulid(),
        kind: 'reusable-llm-prompt-call',
        settings: {
            configuration_id: 'someid1',
            configuration_internal_id: 'someid1',
            values: {},
        },
    },
    category: 'Orders',
})

const template = b.build<ActionTemplate>()

describe('<UseCaseTemplateCard />', () => {
    it('should render card', () => {
        render(<UseCaseTemplateCard template={template} />)

        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('template name')).toBeInTheDocument()
    })

    it('should render modal', () => {
        render(<UseCaseTemplateCard template={template} />)

        act(() => {
            fireEvent.click(screen.getByText('template name'))
        })

        act(() => {
            fireEvent.click(screen.getByText('UseCaseTemplateModal'))
        })

        expect(
            screen.queryByText('UseCaseTemplateModal'),
        ).not.toBeInTheDocument()
    })
})
