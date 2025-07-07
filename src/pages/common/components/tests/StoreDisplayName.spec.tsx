import { render, screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'
import { getIconFromType } from 'state/integrations/helpers'

import StoreDisplayName from '../StoreDisplayName'

describe('<StoreDisplayName />', () => {
    it('should render the component with name and type', () => {
        const name = 'Test Store'
        const type = IntegrationType.Shopify
        render(<StoreDisplayName name={name} type={type} />)

        expect(screen.getByText(name)).toBeInTheDocument()
        expect(screen.getByAltText(name)).toHaveAttribute(
            'src',
            getIconFromType(type),
        )
    })
})
