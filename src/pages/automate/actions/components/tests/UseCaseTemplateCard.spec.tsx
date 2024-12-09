import {render, screen} from '@testing-library/react'
import React from 'react'

import {TemplateConfiguration} from '../../types'

import UseCaseTemplateCard from '../UseCaseTemplateCard'

jest.mock('../UseCaseTemplateConfirmationModal', () => {
    return () => null
})

describe('<UseCaseTemplateCard />', () => {
    beforeEach(() => {})

    it('should render modal', () => {
        const templateConfiguration = {
            category: 'Orders',
            name: 'template name',
        }
        render(
            <UseCaseTemplateCard
                template={templateConfiguration as TemplateConfiguration}
            />
        )

        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('template name')).toBeInTheDocument()
    })
})
