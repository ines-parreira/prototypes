import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithRouter } from 'utils/testing'

import { CountryCodeSelect } from './CountryCodeSelect'

describe('<CountryCodeSelect />', () => {
    const onCountryChange = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (
        props: Partial<React.ComponentProps<typeof CountryCodeSelect>> = {},
    ) =>
        renderWithRouter(
            <CountryCodeSelect onCountryChange={onCountryChange} {...props} />,
        )

    it('should render the US calling code by default', () => {
        renderComponent()

        expect(screen.getByText('+1')).toBeInTheDocument()
    })

    it('should render the calling code for a given selectedCountryCode', () => {
        renderComponent({ selectedCountryCode: 'FR' })

        expect(screen.getByText('+33')).toBeInTheDocument()
    })

    it('should render the calling code for a different country', () => {
        renderComponent({ selectedCountryCode: 'BR' })

        expect(screen.getByText('+55')).toBeInTheDocument()
    })

    describe('dropdown interaction', () => {
        it('should open the dropdown when the trigger is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })
            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })
        })

        it('should list countries in the dropdown', async () => {
            const user = userEvent.setup()
            renderComponent()
            await act(async () => {
                await user.click(screen.getByRole('button'))
            })
            await waitFor(() => {
                expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
            })
        })

        it('should call onCountryChange when a country is selected', async () => {
            const user = userEvent.setup()
            renderComponent()
            await act(async () => {
                await user.click(screen.getByRole('button'))
            })
            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })
            await act(async () => {
                await user.type(screen.getByRole('searchbox'), 'Canada')
            })
            const canadaOption = await screen.findByRole('option', {
                name: /canada/i,
            })
            await act(async () => {
                await user.click(canadaOption)
            })
            await waitFor(() => {
                expect(onCountryChange).toHaveBeenCalledWith('CA')
            })
        })
    })

    describe('search', () => {
        it('should filter countries by search term', async () => {
            const user = userEvent.setup()
            renderComponent()
            await act(async () => {
                await user.click(screen.getByRole('button'))
            })
            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })
            await act(async () => {
                await user.type(screen.getByRole('searchbox'), 'Germany')
            })
            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /germany/i }),
                ).toBeInTheDocument()
            })

            expect(screen.getAllByRole('option')).toHaveLength(1)
        })

        it('should show no options when search has no match', async () => {
            const user = userEvent.setup()
            renderComponent()
            await act(async () => {
                await user.click(screen.getByRole('button'))
            })
            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })
            await act(async () => {
                await user.type(screen.getByRole('searchbox'), 'xyznotacountry')
            })
            await waitFor(() => {
                expect(
                    screen.getByText(/no results found/i),
                ).toBeInTheDocument()
            })
        })

        it('should reset search when dropdown closes', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })
            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })

            await act(async () => {
                await user.type(screen.getByRole('searchbox'), 'Germany')
                await user.click(document.body)
            })

            await waitFor(() => {
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
            })

            await act(async () => {
                await user.click(screen.getByRole('button'))
            })

            await waitFor(() => {
                expect(screen.getAllByRole('option').length).toBeGreaterThan(1)
            })
        })
    })
})
