import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import previewLight from 'assets/img/help-center/preview-light.svg'

import {PreviewRadioButton} from '../PreviewRadioButton'

const onClickFn = jest.fn()

const baseProps = {
    preview: <img src={previewLight} alt="preview-light" />,
    label: 'Light Theme',
    value: 'light',
    onClick: onClickFn,
}

describe('<PreviewRadioButton />', () => {
    it('should match snapshot', () => {
        const {container} = render(<PreviewRadioButton {...baseProps} />)
        expect(container).toMatchSnapshot()
    })

    it('should have the selected className if isSelected is true', () => {
        const {container} = render(
            <PreviewRadioButton {...baseProps} isSelected />
        )
        expect(
            (container.firstChild as HTMLElement).className.includes('selected')
        ).toBeTruthy()
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
        const {container} = render(<PreviewRadioButton {...baseProps} />)
        fireEvent.click(container.firstChild as HTMLElement)
        expect(onClickFn).toHaveBeenCalled()
    })
})
