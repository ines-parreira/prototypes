import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import {NavigationLink} from '../../../../../models/helpCenter/types'
import {getHelpCenterAllNavigationLinksEnglishFixture} from '../../fixtures/getNavigationLinksResponse.fixtures'

import {useNavigationLinks} from '../useNavigationLinks'

const Example = () => {
    const navigation = useNavigationLinks(
        'header',
        (getHelpCenterAllNavigationLinksEnglishFixture.data as unknown) as NavigationLink[]
    )

    return (
        <div>
            {navigation.links.map((link) => {
                const uniqueId = link.id ? link.id.toString() : '123'
                return (
                    <div key={link.id} data-testid={`link-${uniqueId}`}>
                        <input
                            data-testid={`label-${uniqueId}`}
                            defaultValue={link.label}
                            onBlur={(ev) =>
                                navigation.update(
                                    ev.target.value,
                                    link.id as number,
                                    'label'
                                )
                            }
                        />
                        <input
                            data-testid={`value-${uniqueId}`}
                            defaultValue={link.value}
                            onBlur={(ev) =>
                                navigation.update(
                                    ev.target.value,
                                    link.id as number,
                                    'value'
                                )
                            }
                        />
                        <span
                            data-testid={`delete-${uniqueId}`}
                            onClick={() => navigation.remove(link.id as number)}
                        >
                            delete
                        </span>
                    </div>
                )
            })}
            <button data-testid="add" onClick={navigation.add}>
                add
            </button>
        </div>
    )
}

describe('useNavigationLinks', () => {
    it('renders all the header navigation links', () => {
        const {getAllByTestId} = render(<Example />)
        expect(getAllByTestId(/link-*/)).toHaveLength(3)
    })

    it('adds a new link with empty label and value', () => {
        const {getByTestId} = render(<Example />)

        fireEvent.click(getByTestId('add'))

        getByTestId('link-new-1')

        const newLabel = getByTestId('label-new-1') as HTMLInputElement
        expect(newLabel.value).toBe('')

        const newValue = getByTestId('value-new-1') as HTMLInputElement
        expect(newValue.value).toBe('')
    })

    it('removes a link from list', () => {
        const {getByTestId, getAllByTestId} = render(<Example />)

        fireEvent.click(getByTestId('delete-1'))

        expect(getAllByTestId(/link-*/)).toHaveLength(2)
    })

    it('updates the value of a link', () => {
        const {getByTestId} = render(<Example />)

        fireEvent.change(getByTestId('value-1'), {
            target: {value: 'https://nextsite.com'},
        })
        getByTestId('value-1').blur()

        const newValue = getByTestId('value-1') as HTMLInputElement
        expect(newValue.value).toBe('https://nextsite.com')
    })
})
