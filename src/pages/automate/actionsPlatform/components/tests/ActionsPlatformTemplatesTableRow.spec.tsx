import React from 'react'
import {render, screen} from '@testing-library/react'

import {IntegrationType} from 'models/integration/constants'
import useGetDateAndTimeFormat from 'hooks/useGetDateAndTimeFormat'

import ActionsPlatformTemplatesTableRow from '../ActionsPlatformTemplatesTableRow'

jest.mock('hooks/useGetDateAndTimeFormat')

const mockUseGetDateAndTimeFormat = jest.mocked(useGetDateAndTimeFormat)

mockUseGetDateAndTimeFormat.mockReturnValue('MM/DD/YYYY')

const mockGetAppFromTemplateApp = jest.fn().mockReturnValue({
    icon: '/assets/img/integrations/shopify.png',
    id: 'shopify',
    name: 'Shopify',
    type: IntegrationType.Shopify,
})

describe('<ActionsPlatformTemplatesTableRow />', () => {
    it('should render template row', () => {
        render(
            <ActionsPlatformTemplatesTableRow
                template={{
                    name: 'test',
                    apps: [{type: 'shopify'}],
                    updated_datetime: '2024-08-02T08:18:51.611Z',
                }}
                getAppFromTemplateApp={mockGetAppFromTemplateApp}
            />
        )

        expect(screen.getByText('test')).toBeInTheDocument()
        expect(screen.getByTitle('Shopify')).toHaveAttribute(
            'src',
            '/assets/img/integrations/shopify.png'
        )
        expect(screen.getByText('08/02/2024')).toBeInTheDocument()
    })
})
