import {render} from '@testing-library/react'
import React from 'react'

import ModalActionsFooter from '../ModalActionsFooter'

describe('<ModalActionsFooter />', () => {
    const minProps = {
        className: 'custom-class',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render a modal footer', () => {
        const {container} = render(
            <ModalActionsFooter {...minProps}>
                <button>Cancel</button>
                <button>OK</button>
            </ModalActionsFooter>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with extra info on footer', () => {
        const {container} = render(
            <ModalActionsFooter
                {...minProps}
                extra="Ares is the Greek god of courage and war. He is one of the
                Twelve Olympians, and the son of Zeus and Hera"
            >
                <button>Cancel</button>
                <button>OK</button>
            </ModalActionsFooter>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with no extra style if extra is not a string', () => {
        const {container} = render(
            <ModalActionsFooter {...minProps} extra={<button>Foo</button>}>
                <button>Cancel</button>
                <button>OK</button>
            </ModalActionsFooter>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
