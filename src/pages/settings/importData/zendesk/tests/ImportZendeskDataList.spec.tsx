import React from 'react'
import {fireEvent, render, RenderResult} from '@testing-library/react'

import {fromJS, List, Map} from 'immutable'

import history from '../../../../history'
import {ImportZendeskDataList} from '../ImportZendeskDataList'

import {failedImport, pendingImport, successImport} from './fixtures'

interface DefaultProps {
    img: string
    zendeskImports: List<Map<any, any>>
}

const renderComponent = (props: DefaultProps): RenderResult => {
    return render(<ImportZendeskDataList {...props} />)
}

describe('<ImportZendeskDataList/>', () => {
    const defaultProps = {
        img: `/zendesk.png`,
    }
    describe('rendering', () => {
        it('should render the list of imports', () => {
            const {getAllByRole} = renderComponent({
                ...defaultProps,
                zendeskImports: fromJS([
                    successImport,
                    pendingImport,
                    failedImport,
                ]),
            })
            expect(getAllByRole('row').length).toEqual(3)
        })

        it('should render a paused import', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                zendeskImports: fromJS([successImport]),
            })
            expect(getByText('Paused')).toBeDefined()
            expect(getByText(successImport.name)).toBeDefined()
        })
        it('should render a synchronizing import', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                zendeskImports: fromJS([
                    {
                        ...successImport,
                        meta: {
                            ...successImport.meta,
                            continuous_import_enabled: true,
                        },
                    },
                ]),
            })
            expect(getByText('Synchronizing')).toBeDefined()
            expect(getByText(successImport.name)).toBeDefined()
        })

        it('should render a pending import', () => {
            const {getByText, getByRole} = renderComponent({
                ...defaultProps,
                zendeskImports: fromJS([pendingImport]),
            })
            expect(getByText('Progress 10%')).toBeDefined()
            expect(getByText(pendingImport.name)).toBeDefined()
            expect(getByRole('progressbar').getAttribute('style')).toEqual(
                'width: 10%;'
            )
        })

        it('should render a failed import', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                zendeskImports: fromJS([failedImport]),
            })
            expect(getByText(failedImport.meta.error)).toBeDefined()
            expect(getByText(failedImport.name)).toBeDefined()
        })

        it('should redirect to detailed page after user clicked on particular import row', () => {
            const mockedPush = jest.fn()
            jest.mock('react-router-dom', () => ({
                useHistory: () => ({
                    push: mockedPush,
                }),
            }))
            const {getByRole} = renderComponent({
                ...defaultProps,
                zendeskImports: fromJS([successImport]),
            })
            const row = getByRole('row')
            fireEvent.click(row)
            expect(history.push).toBeCalledWith(
                `/app/settings/import-data/zendesk/${successImport.id}`
            )
        })
    })
})
