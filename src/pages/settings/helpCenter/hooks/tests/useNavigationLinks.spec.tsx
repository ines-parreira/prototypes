import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import {getHelpCenterAllNavigationLinksEnglishFixture as mockData} from '../../fixtures/getNavigationLinksResponse.fixtures'

import {useNavigationLinks} from '../useNavigationLinks'

const Example = () => {
    const navigation = useNavigationLinks('header', mockData.data)

    return (
        <div>
            {navigation.links.map((link) => {
                return (
                    <div key={link.id} data-testid={`link-${link.id}`}>
                        <input
                            data-testid={`label-${link.id}`}
                            defaultValue={link.label}
                            onBlur={(ev) =>
                                navigation.update(
                                    ev.target.value,
                                    link.id,
                                    'label'
                                )
                            }
                        />
                        <input
                            data-testid={`value-${link.id}`}
                            defaultValue={link.value}
                            onBlur={(ev) =>
                                navigation.update(
                                    ev.target.value,
                                    link.id,
                                    'value'
                                )
                            }
                        />
                        <span
                            data-testid={`delete-${link.id}`}
                            onClick={() => navigation.remove(link.id)}
                        >
                            delete
                        </span>
                    </div>
                )
            })}
            <button data-testid="add" onClick={() => navigation.add('en-US')}>
                add
            </button>
        </div>
    )
}

const nextId = mockData.data.reduce((sum, link) => {
    if (link.group === 'header') {
        return sum + link.id
    }
    return sum
}, 1)

describe('useNavigationLinks', () => {
    it('renders all the header navigation links', () => {
        const {getAllByTestId} = render(<Example />)
        expect(getAllByTestId(/link-*/)).toHaveLength(3)
    })

    it('adds a new link with empty label and value', () => {
        const {getByTestId} = render(<Example />)

        fireEvent.click(getByTestId('add'))

        getByTestId(`link-${nextId}`)

        const newLabel = getByTestId(`label-${nextId}`) as HTMLInputElement
        expect(newLabel.value).toBe('')

        const newValue = getByTestId(`value-${nextId}`) as HTMLInputElement
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
