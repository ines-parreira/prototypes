import React from 'react'
import {render} from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import EmailIntegrationCreate from '../EmailIntegrationCreate'

jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = useAppSelector as jest.Mock

describe('<EmailIntegrationCreate/>', () => {
    beforeEach(() => {
        useAppSelectorMock
            .mockReturnValueOnce('testGmail')
            .mockReturnValueOnce('testOutlook')
    })

    it('should render', () => {
        const {container} = render(<EmailIntegrationCreate />)

        expect(container.firstChild).toMatchSnapshot()
    })
})
