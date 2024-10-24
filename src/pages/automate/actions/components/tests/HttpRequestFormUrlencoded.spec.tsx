import {screen, render} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {useForm} from 'react-hook-form'

import {CustomActionFormInputValues} from '../../types'
import HttpRequestFormUrlencoded from '../HttpRequestFormUrlencoded'

describe('<HttpRequestFormUrlencoded />', () => {
    it('should render component', () => {
        const {result} = renderHook(() =>
            useForm<CustomActionFormInputValues>({})
        )
        render(
            <HttpRequestFormUrlencoded
                control={result.current.control}
                onBlur={jest.fn()}
                variables={[]}
            />
        )

        expect(screen.getByText('Add Body Data')).toBeInTheDocument()
    })
})
