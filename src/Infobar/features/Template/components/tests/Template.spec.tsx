import React from 'react'
import {render} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'
import {shopifyWidget} from 'fixtures/widgets'
import {
    CardTemplate,
    LeafTemplate,
    ListTemplate,
    WrapperTemplate,
} from 'models/widget/types'
import {
    Extensions,
    getExtensions,
} from 'Infobar/features/Template/helpers/extensions'

import {WidgetContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/WidgetContext'
import Card from 'Infobar/features/Card'
import Field from 'Infobar/features/Field'
import Wrapper from 'Infobar/features/Wrapper'
import ListWidget from 'Infobar/features/List'

import Template, {self} from '../Template'

jest.spyOn(self, 'Template')
const spiedTemplate = assumeMock(self.Template)

jest.mock('Infobar/features/Card')
jest.mock('Infobar/features/Field')
jest.mock('Infobar/features/Wrapper')
jest.mock('Infobar/features/List')
jest.mock('Infobar/features/Template/helpers/extensions')
const cardMock = assumeMock(Card)
const fieldMock = assumeMock(Field)
const wrapperMock = assumeMock(Wrapper)
const listMock = assumeMock(ListWidget)
const getExtensionsMock = assumeMock(getExtensions)

const editionHiddenFields = ['bar']

getExtensionsMock.mockImplementation(
    () =>
        ({
            AfterTitle: () => <div>AfterTitle</div>,
            editionHiddenFields,
        } as Extensions)
)

const leafTemplate = {type: 'text'} as LeafTemplate
const cardTemplate = {
    type: 'card',
    widgets: [leafTemplate, leafTemplate],
} as CardTemplate
const wrapperTemplate = {
    type: 'wrapper',
    widgets: [cardTemplate, cardTemplate],
} as WrapperTemplate
const listTemplate = {type: 'list', widgets: [leafTemplate]} as ListTemplate

const minProps = {
    parentTemplate: undefined,
    template: cardTemplate,
    source: {
        path1: 'foo',
    },
}

fieldMock.mockImplementation(() => <div>Field</div>)
describe('Template', () => {
    beforeEach(() => {
        cardMock.mockImplementation(() => <div></div>)
        listMock.mockImplementation(() => <div></div>)
        wrapperMock.mockImplementation(() => <div></div>)
    })

    afterEach(() => {
        cardMock.mockClear()
        wrapperMock.mockClear()
        listMock.mockClear()
    })
    describe('extensions', () => {
        it('should provide the correct extensions', () => {
            render(
                <WidgetContext.Provider value={shopifyWidget}>
                    <Template {...minProps} />
                </WidgetContext.Provider>
            )

            expect(getLastMockCall(cardMock)[0].extensions).toEqual({
                AfterTitle: expect.any(Function),
                editionHiddenFields,
            })
        })

        it('should provide the correct editionHiddenFields', () => {
            render(
                <WidgetContext.Provider value={shopifyWidget}>
                    <Template {...minProps} />
                </WidgetContext.Provider>
            )

            expect(getLastMockCall(cardMock)[0].editionHiddenFields).toEqual(
                editionHiddenFields
            )
        })
    })

    describe('Wrapper', () => {
        it('should pass correct props to Wrapper', () => {
            render(<Template {...minProps} template={wrapperTemplate} />)

            expect(getLastMockCall(wrapperMock)[0]).toEqual({
                source: minProps.source,
                template: wrapperTemplate,
                children: expect.anything(),
            })
        })

        it('should call Template recursively with correct props', () => {
            wrapperMock.mockImplementation(({children}) => (
                <div>{children}</div>
            ))
            render(<Template {...minProps} template={wrapperTemplate} />)

            expect(spiedTemplate).toHaveBeenCalledTimes(2)
            expect(getLastMockCall(spiedTemplate)[0]).toEqual({
                parentTemplate: wrapperTemplate,
                template: expect.objectContaining({
                    ...cardTemplate,
                    absolutePath: expect.any(Array),
                    templatePath: expect.any(String),
                }),
                source: minProps.source,
            })
        })
    })

    describe('List', () => {
        const validListSource = [{ok: 'foo'}]

        it.each([
            [{}, listTemplate],
            [[], listTemplate],
            [validListSource, {...listTemplate, widgets: []} as ListTemplate],
        ])(
            'should not render if source is not ok or template is missing',
            (source, template) => {
                render(
                    <Template
                        {...minProps}
                        source={source}
                        template={template}
                    />
                )

                expect(listMock).not.toHaveBeenCalled()
            }
        )

        it('should pass correct props to List', () => {
            render(
                <Template
                    {...minProps}
                    template={listTemplate}
                    source={validListSource}
                />
            )

            expect(getLastMockCall(listMock)[0]).toEqual({
                isEditing: false,
                source: validListSource,
                template: listTemplate,
                children: expect.anything(),
            })
        })

        it('should call Template recursively with correct props', () => {
            listMock.mockImplementation(({children}) => (
                <div>{children(undefined, 0)}</div>
            ))
            render(
                <Template
                    {...minProps}
                    template={listTemplate}
                    source={validListSource}
                />
            )

            expect(spiedTemplate).toHaveBeenCalledTimes(1)
            expect(getLastMockCall(spiedTemplate)[0]).toEqual({
                isFirstOfList: true,
                parentTemplate: listTemplate,
                template: expect.objectContaining({
                    ...leafTemplate,
                    absolutePath: expect.any(Array),
                    templatePath: expect.any(String),
                }),
                source: undefined,
            })
        })
    })

    describe('Card', () => {
        it.each([undefined, {}])(
            'should not render if source is not ok',
            (source) => {
                render(
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Template {...minProps} source={source} />
                    </WidgetContext.Provider>
                )
                expect(cardMock).not.toHaveBeenCalled()
            }
        )

        it('should not render if source is not ok but widget type is standalone', () => {
            render(<Template {...minProps} source={undefined} />)
            expect(cardMock).toHaveBeenCalled()
        })

        it('should pass correct props to Card', () => {
            render(
                <Template
                    {...minProps}
                    parentTemplate={wrapperTemplate}
                    isFirstOfList
                />
            )

            expect(getLastMockCall(cardMock)[0]).toEqual(
                expect.objectContaining({
                    isEditing: false,
                    source: minProps.source,
                    template: minProps.template,
                    parentTemplate: wrapperTemplate,
                    isFirstOfList: true,
                })
            )
        })

        it('should call Template recursively with correct props', () => {
            cardMock.mockImplementation(({children}) => <div>{children}</div>)
            render(<Template {...minProps} template={cardTemplate} />)

            expect(spiedTemplate).toHaveBeenCalledTimes(2)
            expect(getLastMockCall(spiedTemplate)[0]).toEqual({
                parentTemplate: cardTemplate,
                template: expect.objectContaining({
                    ...leafTemplate,
                    absolutePath: expect.any(Array),
                    templatePath: expect.any(String),
                }),
                source: minProps.source,
            })
        })
    })

    describe('Field', () => {
        it('should pass correct props to Field', () => {
            render(
                <Template
                    {...minProps}
                    template={leafTemplate}
                    source={'foo'}
                />
            )

            expect(getLastMockCall(fieldMock)[0]).toEqual({
                isEditing: false,
                type: leafTemplate.type,
                value: 'foo',
                template: leafTemplate,
                copyableValue: 'foo',
            })
        })
    })
})
