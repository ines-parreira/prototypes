import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import ActionsTemplatesCards from '../components/ActionsTemplatesCards'
import {TemplateConfiguration} from '../types'

jest.mock(
    '../components/AppActionTemplateCard',
    () =>
        ({templateName}: {templateName: string}) => (
            <div>app template: {templateName}</div>
        )
)
jest.mock(
    '../components/NativeActionTemplateCard',
    () =>
        ({templateName}: {templateName: string}) => (
            <div>native template: {templateName}</div>
        )
)

describe('<ActionsTemplatesCards />', () => {
    it('should render action template cards', () => {
        renderWithRouter(
            <ActionsTemplatesCards
                templateConfigurations={[
                    {
                        id: 'testid1',
                        internal_id: 'testinternal_id1',
                        name: 'test1',
                        apps: [
                            {
                                type: 'app',
                                app_id: 'someid',
                            },
                        ],
                    } as TemplateConfiguration,
                    {
                        id: 'testid2',
                        internal_id: 'testinternal_id2',
                        name: 'test2',
                        apps: [
                            {
                                type: 'shopify',
                            },
                        ],
                    } as TemplateConfiguration,
                ]}
            />
        )

        expect(screen.getByText('app template: test1')).toBeInTheDocument()
        expect(screen.getByText('native template: test2')).toBeInTheDocument()
    })

    it('should render create custom Action card', () => {
        const history = createMemoryHistory({
            initialEntries: ['/shopify/acme/ai-agent/actions/templates'],
        })

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <ActionsTemplatesCards
                templateConfigurations={[]}
                showCustomAction
            />,
            {
                history,
                path: '/:shopType/:shopName/ai-agent/actions/templates',
                route: '/shopify/acme/ai-agent/actions/templates',
            }
        )

        act(() => {
            fireEvent.click(screen.getByText('Create custom Action'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/shopify/acme/ai-agent/actions/new'
        )
    })
})
