import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import previewLight from 'assets/img/help-center/preview-light.svg'

import {
    PreviewRadioButton,
    PreviewRadioButtonProps,
} from '../PreviewRadioButton'

const onClickFn = jest.fn()

const baseProps: PreviewRadioButtonProps = {
    preview: <img src={previewLight} alt="preview-light" />,
    title: 'Light Theme',
    onClick: onClickFn,
}

describe('<PreviewRadioButton />', () => {
    it('matches snapshot', () => {
        const {container} = render(<PreviewRadioButton {...baseProps} />)
        expect(container).toMatchSnapshot()
    })
    it('has the selected className if isSelected is true', () => {
        const {getByRole} = render(
            <PreviewRadioButton {...baseProps} isSelected />
        )
        expect(getByRole('button').className.includes('selected')).toBeTruthy()
    })
    it('renders the proper preview', () => {
        const {getByAltText} = render(<PreviewRadioButton {...baseProps} />)
        getByAltText('preview-light')
    })
    it('has the on click event listener', () => {
        const {getByRole} = render(<PreviewRadioButton {...baseProps} />)
        fireEvent.click(getByRole('button'))
        expect(onClickFn).toHaveBeenCalled()
    })
})
