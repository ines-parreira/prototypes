import { logEvent, SegmentEvent } from '@repo/logging'
import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import { OBJECT_TYPES } from 'custom-fields/constants'
import * as fileUtils from 'utils/file'

import { DropdownCSVImport } from '../DropdownCSVImport'

jest.mock('@repo/logging')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>
const props = {
    isOpen: true,
    onImport: jest.fn(),
    onClose: jest.fn(),
    needsConfirmation: false,
    objectType: OBJECT_TYPES.TICKET,
}
describe('<DropdownCSVImport/>', () => {
    afterEach(() => {
        toast.dismiss()
    })
    const simulateDrop = (dropZone: HTMLElement, contents: string) => {
        const dummyFile = {
            getAsFile: () =>
                new File([contents], 'file.csv', { type: 'text/csv' }),
        }
        return waitFor(() =>
            fireEvent.drop(dropZone, {
                dataTransfer: {
                    items: [dummyFile],
                    files: [dummyFile],
                },
            }),
        )
    }
    it('should render when open', () => {
        const { baseElement } = render(<DropdownCSVImport {...props} />, {})
        expect(baseElement).toMatchSnapshot()
    })
    it('should not render when closed', () => {
        const { baseElement } = render(
            <DropdownCSVImport {...props} isOpen={false} />,
            {},
        )
        expect(baseElement).toMatchSnapshot()
    })
    it('should call onClose() when the close icon is clicked', () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        fireEvent.click(getByText('×'))
        expect(props.onClose).toHaveBeenCalled()
    })
    it('should download template when clicked', async () => {
        const saveFileAsDownloaded = jest
            .spyOn(fileUtils, 'saveFileAsDownloaded')
            .mockReturnValue()
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        fireEvent.click(getByText('CSV template'))
        await waitFor(() => expect(saveFileAsDownloaded).toHaveBeenCalled())
    })
    it('should render footer when a file is set', async () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        const dropZone = getByText('Drop your CSV here, or')
        await simulateDrop(dropZone, 'value')
        expect(getByText('Import File')).toBeTruthy()
    })
    it('should call onImport() and onClose() on successful import', async () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        const dropZone = getByText('Drop your CSV here, or')
        await simulateDrop(dropZone, 'value1,sub1\nvalue2,sub2')
        await waitFor(() => fireEvent.click(getByText('Import File')))
        await waitFor(() => props.onClose.mock.calls.length > 0)
        expect(props.onImport).toHaveBeenCalledWith([
            'value1::sub1',
            'value2::sub2',
        ])
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: '2 values successfully imported.',
                }),
            ).toHaveAttribute('data-intent', 'success')
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldDropdownCsvImportSuccessful,
            { count: 2, objectType: OBJECT_TYPES.TICKET },
        )
    })
    it('should allow escaping commas using quotes', async () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        const dropZone = getByText('Drop your CSV here, or')
        await simulateDrop(dropZone, '"value,with,commas",sub1\nvalue2,sub2')
        await waitFor(() => fireEvent.click(getByText('Import File')))
        await waitFor(() => props.onClose.mock.calls.length > 0)
        expect(props.onImport).toHaveBeenCalledWith([
            'value,with,commas::sub1',
            'value2::sub2',
        ])
    })
    it('should fail to import invalid CSV files', async () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        const dropZone = getByText('Drop your CSV here, or')
        await simulateDrop(dropZone, 'a\nb,c')
        await waitFor(() => fireEvent.click(getByText('Import File')))
        await waitFor(() => props.onClose.mock.calls.length > 0)
        expect(props.onImport).not.toHaveBeenCalled()
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Import was unsuccessful: Invalid CSV file: Invalid Record Length: expect 1, got 2 on line 2',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldDropdownCsvImportError,
            {
                objectType: OBJECT_TYPES.TICKET,
            },
        )
    })
    it('should fail to import on duplicated values', async () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        const dropZone = getByText('Drop your CSV here, or')
        await simulateDrop(dropZone, 'value1\nvalue1')
        await waitFor(() => fireEvent.click(getByText('Import File')))
        await waitFor(() => props.onClose.mock.calls.length > 0)
        expect(props.onImport).not.toHaveBeenCalled()
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Import was unsuccessful: File has duplicates',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldDropdownCsvImportError,
            {
                objectType: OBJECT_TYPES.TICKET,
            },
        )
    })
    it('should fail to import on values with more than 5 levels of nesting', async () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        const dropZone = getByText('Drop your CSV here, or')
        await simulateDrop(dropZone, 'a,b,c,d,e,f')
        await waitFor(() => fireEvent.click(getByText('Import File')))
        await waitFor(() => props.onClose.mock.calls.length > 0)
        expect(props.onImport).not.toHaveBeenCalled()
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Import was unsuccessful: Some values have more than 5 nested children levels',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldDropdownCsvImportError,
            {
                objectType: OBJECT_TYPES.TICKET,
            },
        )
    })
    it('should fail to import more than 2,000 values', async () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        const dropZone = getByText('Drop your CSV here, or')
        const contents = Array.from(Array(2100).keys()).join('\n')
        await simulateDrop(dropZone, contents)
        await waitFor(() => fireEvent.click(getByText('Import File')))
        await waitFor(() => props.onClose.mock.calls.length > 0)
        expect(props.onImport).not.toHaveBeenCalled()
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Import was unsuccessful: File has more than 2,000 values',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldDropdownCsvImportError,
            {
                objectType: OBJECT_TYPES.TICKET,
            },
        )
    })
    it('should use a list for errors when there is more than one', async () => {
        const { getByText } = render(<DropdownCSVImport {...props} />, {})
        const dropZone = getByText('Drop your CSV here, or')
        await simulateDrop(dropZone, 'a,b,c,d,e,f\na,b,c,d,e,f')
        await waitFor(() => fireEvent.click(getByText('Import File')))
        await waitFor(() => props.onClose.mock.calls.length > 0)
        expect(props.onImport).not.toHaveBeenCalled()
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Import was unsuccessful: <ul><li>File has duplicates</li><li>Some values have more than 5 nested children levels</li></ul>',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldDropdownCsvImportError,
            {
                objectType: OBJECT_TYPES.TICKET,
            },
        )
    })
    it("should not call log events if objectType is not 'Ticket'", async () => {
        const { getByText } = render(
            <DropdownCSVImport {...props} objectType={OBJECT_TYPES.CUSTOMER} />,
            {},
        )
        const dropZone = getByText('Drop your CSV here, or')
        await simulateDrop(dropZone, 'value1,sub1\nvalue2,sub2')
        await waitFor(() => fireEvent.click(getByText('Import File')))
        await waitFor(() => props.onClose.mock.calls.length > 0)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.CustomFieldDropdownCsvImportSuccessful,
            { count: 2, objectType: OBJECT_TYPES.CUSTOMER },
        )
    })
})
