const windowLocation = JSON.stringify(window.location)
// @ts-expect-error testing override
delete window.location
window.location = JSON.parse(windowLocation)
window.location.reload = vi.fn()

window.CSRF_TOKEN = 'abcd'
window.GORGIAS_RELEASE = '1'

Element.prototype.setPointerCapture = vi.fn()
Element.prototype.releasePointerCapture = vi.fn()
