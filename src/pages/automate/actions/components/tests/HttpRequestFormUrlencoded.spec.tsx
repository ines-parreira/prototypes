import React from 'react'
import {screen, render} from '@testing-library/react'
import {useForm} from 'react-hook-form'
import {renderHook} from '@testing-library/react-hooks'
import HttpRequestFormUrlencoded from '../HttpRequestFormUrlencoded'
import {CustomActionFormInputValues} from '../../types'

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
