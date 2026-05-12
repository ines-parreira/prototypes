import { render, userEvent } from '@repo/testing'

import { AppRow } from './AppRow'

describe('AppRow', () => {
    it('shows the configured badge for configured apps', () => {
        const { getByText } = render(
            <AppRow
                iconUrl="/img/shopify.svg"
                name="Shopify"
                actionCount={23}
                status="configured"
                onClick={() => {}}
            />,
        )
        expect(getByText('Shopify')).toBeInTheDocument()
        expect(getByText('23 actions')).toBeInTheDocument()
        expect(getByText('Configured')).toBeInTheDocument()
    })

    it('renders a connect button that does not bubble row clicks', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        const onConnect = jest.fn()
        const { getByText } = render(
            <AppRow
                iconUrl="/img/shipbob.svg"
                name="ShipBob"
                actionCount={5}
                status="connect"
                onClick={onClick}
                onConnect={onConnect}
            />,
        )
        await user.click(getByText('Connect'))
        expect(onConnect).toHaveBeenCalledTimes(1)
        expect(onClick).not.toHaveBeenCalled()
    })

    it('singularizes the action count for a single action', () => {
        const { getByText } = render(
            <AppRow
                iconUrl="/img/yotpo.svg"
                name="Yotpo"
                actionCount={1}
                status="connect"
                onConnect={() => {}}
            />,
        )
        expect(getByText('1 action')).toBeInTheDocument()
    })

    it('highlights the matching part of the name when a search query is provided', () => {
        const { container } = render(
            <AppRow
                iconUrl="/img/shipstation.svg"
                name="ShipStation"
                actionCount={7}
                status="configured"
                searchQuery="ship"
                onClick={() => {}}
            />,
        )
        const heading = container.querySelector('h5')
        expect(heading?.textContent).toBe('ShipStation')
        const marks = container.querySelectorAll('mark')
        expect(marks).toHaveLength(1)
        expect(marks[0]).toHaveTextContent('Ship')
    })

    it('triggers onClick when the row is activated via keyboard', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        const { getByRole } = render(
            <AppRow
                iconUrl="/img/shopify.svg"
                name="Shopify"
                actionCount={23}
                status="configured"
                onClick={onClick}
            />,
        )
        getByRole('button').focus()
        await user.keyboard('{Enter}')
        await user.keyboard(' ')
        expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('triggers onClick when the row body is clicked', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        const { getByRole } = render(
            <AppRow
                iconUrl="/img/shopify.svg"
                name="Shopify"
                actionCount={23}
                status="configured"
                onClick={onClick}
            />,
        )
        await user.click(getByRole('button'))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('renders a non-interactive row when no onClick is provided', () => {
        const { queryByRole, getByText } = render(
            <AppRow
                iconUrl="/img/shopify.svg"
                name="Shopify"
                actionCount={23}
                status="configured"
            />,
        )
        expect(getByText('Shopify')).toBeInTheDocument()
        expect(queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders no trailing action when status is connect without an onConnect handler', () => {
        const { queryByText } = render(
            <AppRow
                iconUrl="/img/shipbob.svg"
                name="ShipBob"
                actionCount={5}
                status="connect"
            />,
        )
        expect(queryByText('Connect')).not.toBeInTheDocument()
        expect(queryByText('Configured')).not.toBeInTheDocument()
    })
})
