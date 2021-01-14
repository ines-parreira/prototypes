import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import {EditorState} from 'draft-js'

import {SignatureContainer} from '../Signature'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

const defaultSignature = {
    html: '<div><br /></div><div>Some signature</div>',
    text: '\nSome signature',
}

const defaultProps: ComponentProps<typeof SignatureContainer> = {
    editorState: EditorState.createEmpty(),
    signature: fromJS(defaultSignature),
    isDirty: false,
    addSignature: jest.fn(),
}

describe('<Signature />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the signature button', () => {
        const {container} = render(<SignatureContainer {...defaultProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render the signature button if signature is not set', () => {
        const {container} = render(
            <SignatureContainer {...defaultProps} signature={fromJS({})} />
        )
        expect(container.firstChild).toBe(null)
    })

    it('should render the signature button when signature has only text', () => {
        const {container} = render(
            <SignatureContainer
                {...defaultProps}
                signature={fromJS({
                    text: defaultSignature.text,
                })}
            />
        )
        expect(container.firstChild).not.toBe(null)
    })

    it('should render the signature button when signature has only html', () => {
        const {container} = render(
            <SignatureContainer
                {...defaultProps}
                signature={fromJS({
                    html: defaultSignature.html,
                })}
            />
        )
        expect(container.firstChild).not.toBe(null)
    })

    it('should add signature on click', () => {
        const {editorState, signature} = defaultProps
        const {getByTitle} = render(<SignatureContainer {...defaultProps} />)
        fireEvent.click(getByTitle('Show signature'))
        expect(defaultProps.addSignature).toHaveBeenLastCalledWith(
            editorState.getCurrentContent(),
            signature
        )
    })

    it('should hide the button after it was clicked', () => {
        const {getByTitle, container} = render(
            <SignatureContainer {...defaultProps} />
        )
        fireEvent.click(getByTitle('Show signature'))
        expect(container.firstChild).toBe(null)
    })

    it('should show the button after the it changes to not dirty', () => {
        const {getByTitle, container, rerender} = render(
            <SignatureContainer {...defaultProps} />
        )
        fireEvent.click(getByTitle('Show signature'))
        rerender(<SignatureContainer {...defaultProps} isDirty={false} />)
        expect(container.firstChild).not.toBe(null)
    })
})
