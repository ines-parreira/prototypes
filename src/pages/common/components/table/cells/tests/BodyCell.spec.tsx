import React from 'react'
import {render} from '@testing-library/react'

import BodyCell from '../BodyCell'

describe('<BodyCell/>', () => {
    it('should render', () => {
        const tableRow = document.createElement('tr')

        const {container} = render(<BodyCell className="foo">Foo</BodyCell>, {
            container: document.body.appendChild(tableRow),
        })

        expect(container).toMatchSnapshot()
    })

    it('should render in small size', () => {
        const tableRow = document.createElement('tr')

        const {container} = render(
            <BodyCell className="foo" size="small">
                Foo
            </BodyCell>,
            {
                container: document.body.appendChild(tableRow),
            }
        )

        expect(container).toMatchSnapshot()
    })

    it('should render in smallest size', () => {
        const tableRow = document.createElement('tr')

        const {container} = render(
            <BodyCell className="foo" size="smallest">
                Foo
            </BodyCell>,
            {
                container: document.body.appendChild(tableRow),
            }
        )

        expect(container).toMatchSnapshot()
    })

    it('should render with custom width', () => {
        const tableRow = document.createElement('tr')

        const {container} = render(
            <BodyCell className="foo" width={200}>
                Foo
            </BodyCell>,
            {
                container: document.body.appendChild(tableRow),
            }
        )

        expect(container).toMatchSnapshot()
    })

    it('should render and pass innerClassName prop', () => {
        const tableRow = document.createElement('tr')

        const {container} = render(
            <BodyCell className="foo" innerClassName="bar">
                Foo
            </BodyCell>,
            {
                container: document.body.appendChild(tableRow),
            }
        )

        expect(container).toMatchSnapshot()
    })
})
