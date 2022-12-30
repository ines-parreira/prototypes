import {cleanup, fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import FacebookLoginButton from '../FacebookLoginButton'

describe('FacebookLoginButton component', () => {
    afterEach(cleanup)

    it('should call onClick', () => {
        const onClick = jest.fn()
        render(<FacebookLoginButton onClick={onClick} />)

        fireEvent.click(screen.getByText(/login with facebook/i))

        expect(onClick).toHaveBeenCalled()
    })

    it('should show icon', () => {
        render(<FacebookLoginButton showIcon />)

        expect(screen.getByAltText(/facebook\-logo/i)).toBeVisible()
    })

    it('should not show icon', () => {
        render(<FacebookLoginButton />)

        expect(screen.queryByAltText(/facebook\-logo/i)).toBeFalsy()
    })

    it('should display children', () => {
        render(<FacebookLoginButton>children</FacebookLoginButton>)

        expect(screen.getByText(/children/i)).toBeVisible()
    })
})
