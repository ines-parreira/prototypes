export class jsPDF {
    constructor() {}
    text = jest.fn()
    addPage = jest.fn()
    save = jest.fn()
    addImage = jest.fn()
    setFontSize = jest.fn()
    setFont = jest.fn()
    setTextColor = jest.fn()
    setDrawColor = jest.fn()
    setFillColor = jest.fn()
    rect = jest.fn()
    line = jest.fn()
    circle = jest.fn()
    setLineWidth = jest.fn()
    getNumberOfPages = jest.fn(() => 1)
    internal = {
        pageSize: {
            width: 210,
            height: 297,
        },
    }
}
