import React from 'react'
import {render, screen} from '@testing-library/react'

import Errors, {ErrorsContext, ErrorsCollector} from '../Errors'

describe('Errors component', () => {
    it('should return null if there is no errors', () => {
        const {
            container: {firstChild},
        } = render(<Errors />)
        expect(firstChild).toMatchSnapshot()
    })

    it('should render inline errors', () => {
        const {
            container: {firstChild},
        } = render(<Errors inline={true}>Foo</Errors>)

        expect(firstChild).toMatchSnapshot()
    })

    it('should render block errors', () => {
        const {
            container: {firstChild},
        } = render(<Errors>Foo</Errors>)

        expect(firstChild).toMatchSnapshot()
    })

    it('should render block errors with display adjustements to display it below an input', () => {
        const {
            container: {firstChild},
        } = render(<Errors belowInput={true}>Foo</Errors>)

        expect(firstChild).toMatchSnapshot()
    })

    it('should render using passed tag', () => {
        const {
            container: {firstChild},
        } = render(<Errors tag="pre">Foo</Errors>)

        expect(firstChild).toMatchSnapshot()
    })

    it('should collect errors', () => {
        render(
            <ErrorsCollector>
                <div data-testid="errors">
                    <ErrorsContext.Consumer>
                        {({errors}) => errors.size}
                    </ErrorsContext.Consumer>
                </div>
                <Errors>Foo</Errors>
                <Errors>Bar</Errors>
                <Errors>Baz</Errors>
            </ErrorsCollector>
        )

        expect(screen.getByTestId('errors').innerHTML).toBe('3')
    })
})
