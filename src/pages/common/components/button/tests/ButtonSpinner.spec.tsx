import {render} from '@testing-library/react'
import React from 'react'

import {BaseButtonContext} from '../BaseButton'
import ButtonSpinner from '../ButtonSpinner'

describe('<ButtonSpinner />', () => {
    it('should render a spinner', () => {
        const {container} = render(<ButtonSpinner />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a small loader', () => {
        const {container} = render(
            <BaseButtonContext.Provider value={{size: 'small'}}>
                <ButtonSpinner />
            </BaseButtonContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
