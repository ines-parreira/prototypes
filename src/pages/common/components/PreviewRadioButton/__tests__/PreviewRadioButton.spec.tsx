import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import previewLight from 'assets/img/help-center/preview-light.svg'

import {PreviewRadioButton} from '../PreviewRadioButton'

const onClickFn = jest.fn()

const baseProps = {
    title: 'Light Theme',
    onClick: onClickFn,
}

describe('<PreviewRadioButton />', () => {
    it('should match snapshot', () => {
        const {container} = render(<PreviewRadioButton {...baseProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should have the selected className if isSelected is true', () => {
        const {getByRole} = render(
            <PreviewRadioButton {...baseProps} isSelected />
        )
        expect(getByRole('button').className.includes('selected')).toBeTruthy()
    })

    it('should render the proper preview', () => {
        const {getByAltText} = render(
            <PreviewRadioButton
                {...baseProps}
                preview={<img src={previewLight} alt="preview-light" />}
            />
        )
        getByAltText('preview-light')
    })

    it('should have the onClick event listener', () => {
        const {getByRole} = render(<PreviewRadioButton {...baseProps} />)
        fireEvent.click(getByRole('button'))
        expect(onClickFn).toHaveBeenCalled()
    })
})
