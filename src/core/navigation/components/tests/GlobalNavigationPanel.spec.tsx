import {render, screen} from '@testing-library/react'
import React from 'react'

import {Panels} from 'core/layout/panels'

import GlobalNavigationPanel from '../GlobalNavigationPanel'

jest.mock('common/navigation', () => ({
    GlobalNavigation: () => <div>GlobalNavigation</div>,
}))

describe('GlobalNavigationPanel', () => {
    it('should render the global navigation', () => {
        render(
            <Panels size={1000}>
                <GlobalNavigationPanel />
            </Panels>
        )
        expect(screen.getByText('GlobalNavigation')).toBeInTheDocument()
    })
})
