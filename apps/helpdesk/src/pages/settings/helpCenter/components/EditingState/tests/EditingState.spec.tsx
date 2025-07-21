import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditingStateEnum } from 'pages/settings/helpCenter/constants'

import EditingState from '../EditingState'

describe('<EditingState />', () => {
    describe('when state is PUBLISHED', () => {
        it('should render published badge with check circle icon and correct tooltip', async () => {
            render(<EditingState state={EditingStateEnum.PUBLISHED} />)

            expect(screen.getByText(/published/i)).toBeInTheDocument()
            expect(screen.getByText('check_circle')).toBeInTheDocument()

            fireEvent.mouseOver(screen.getByText(/published/i))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Article content reflects the published version.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })

    describe('when state is UNSAVED', () => {
        it('should render unsaved badge with edit icon and correct tooltip', async () => {
            render(<EditingState state={EditingStateEnum.UNSAVED} />)

            expect(screen.getByText(/unsaved/i)).toBeInTheDocument()
            expect(screen.getByText('edit')).toBeInTheDocument()

            fireEvent.mouseOver(screen.getByText(/unsaved/i))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Recent changes to this article have not been saved.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })

    describe('when state is SAVED', () => {
        it('should render saved badge with save icon and correct tooltip', async () => {
            render(<EditingState state={EditingStateEnum.SAVED} />)

            expect(screen.getByText(/saved/i)).toBeInTheDocument()
            expect(screen.getByText('save')).toBeInTheDocument()

            fireEvent.mouseOver(screen.getByText(/saved/i))

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Recent saved changes to this article are unpublished.',
                    ),
                ).toBeInTheDocument()
            })
        })
    })
})
