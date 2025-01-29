import {screen} from '@testing-library/react'
import React from 'react'

import {useFlag} from 'core/flags'
import {renderWithRouter} from 'utils/testing'

import CreateActionViewContainer from '../CreateActionViewContainer'

jest.mock('core/flags')
jest.mock('../CreateActionFormView', () => () => (
    <div>CreateActionFormView</div>
))
jest.mock('../CreateActionView', () => () => <div>CreateActionView</div>)

const mockUseFlag = jest.mocked(useFlag)

describe('<CreateActionViewContainer />', () => {
    it('should render multi step create Action view if feature flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)

        renderWithRouter(<CreateActionViewContainer />)

        expect(screen.getByText('CreateActionView')).toBeInTheDocument()
    })

    it('should render create Action form view if feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        renderWithRouter(<CreateActionViewContainer />)

        expect(screen.getByText('CreateActionFormView')).toBeInTheDocument()
    })

    it('should render create Action form view if feature flag is enabled but template is used', () => {
        mockUseFlag.mockReturnValue(true)

        renderWithRouter(<CreateActionViewContainer />, {
            route: '/app/automation/shopify/acme/actions/new?template_id=123',
            path: '/app/automation/:shopType/:shopName/actions/new',
        })

        expect(screen.getByText('CreateActionFormView')).toBeInTheDocument()
    })
})
