import React, {ComponentProps} from 'react'
import {createMemoryHistory} from 'history'

import {renderWithRouter} from '../../../../utils/testing'
import Navbar from '../../../common/components/Navbar.js'
import ViewNavbarView from '../../../common/components/ViewNavbarView/ViewNavbarView'
import {CustomerNavbarContainer} from '../CustomerNavbarContainer'

jest.mock(
    '../../../common/components/Navbar',
    () => ({children}: ComponentProps<typeof Navbar>) => (
        <div>
            Navbar: <div>children: {children}</div>
        </div>
    )
)

jest.mock(
    '../../../common/components/ViewNavbarView',
    () => ({settingType, isLoading}: ComponentProps<typeof ViewNavbarView>) => (
        <div>
            <div>isLoading: {JSON.stringify(isLoading)}</div>
            <div>settingType: {settingType}</div>
        </div>
    )
)

describe('<CustomerNavbarContainer />', () => {
    const minProps = {
        fetchViews: jest.fn(),
        isLoading: false,
    }

    it('should display', () => {
        const {container} = renderWithRouter(
            <CustomerNavbarContainer {...minProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch views on initial load and when route parameters are updated', () => {
        const history = createMemoryHistory()

        const {rerender} = renderWithRouter(
            <CustomerNavbarContainer {...minProps} />,
            {
                history,
                path: '/',
            }
        )
        expect(minProps.fetchViews).toHaveBeenCalledWith(undefined)

        const viewId = '11'
        history.push(`?viewId=${viewId}`)
        rerender(<CustomerNavbarContainer {...minProps} />)

        const newViewId = '12'
        expect(minProps.fetchViews).toHaveBeenLastCalledWith(viewId)
        history.push(`?q=search terms&viewId=${newViewId}`)

        rerender(<CustomerNavbarContainer {...minProps} />)

        expect(minProps.fetchViews).toHaveBeenLastCalledWith(newViewId)
    })
})
