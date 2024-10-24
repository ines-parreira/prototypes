import {render} from '@testing-library/react'
import React from 'react'

import {InfobarTabs} from '../InfobarTabs'

describe('<InfobarTabs/>', () => {
    it('should render', () => {
        const widgetNames = ['widget1', 'widget2']
        const {container} = render(<InfobarTabs widgetNames={widgetNames} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render if there is only one widget or less', () => {
        const widgetNames = ['widget1']
        const {container} = render(<InfobarTabs widgetNames={widgetNames} />)
        expect(container.firstChild).toBeNull()
    })
})
