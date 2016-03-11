import React from 'react'

/*** Paginator
* A paginator component.
*
* Properties
* ----------
* - ***totalPages***: the number of total pages
* - ***className***: additional top level class name
* - ***page***: (default: 1) the current page number (1-based)
* - ***radius***: (default: 1) the number of page links (moving out from current page) to show
* - ***anchor***: (default: 1) the number of page links (moving out from each end) to show
* - ***onChange***: called when the user clicked a page number
*
* Example
* ---------
*     <Paginator page={2} totalPages={12} onChange={funtion(pageNumber) {...}}/>
***/

const eventBinder = function(value, type, context, cancelEvent) {
  return function(event) {
    if (cancelEvent) {
      event.stopPropagation()
      event.preventDefault()
    }
    if (context[type]) {
      context[type](value, event)
    }
    if (context.props[type]) {
      context.props[type](value, event)
    }
  }
}


export default class Paginator extends React.Component {
  render() {
    var totalPages = this.props.totalPages
    if (totalPages && totalPages > 1) {
      var current = this.props.page,
          radius = this.props.radius || 0,
          anchor = this.props.anchor || 1,
          separator = this.props.separator || '...',
          min = Math.max(current - radius, 1),
          max = Math.min(current + radius, totalPages),
          showArrows = this.props.showArrows === undefined ? true : this.props.showArrows,
          totalShowing = (radius * 2) + (anchor * 2) + 3 /* current + separator */,
          showRightSeparator = (totalPages > current + radius + anchor),
          showLeftSeparator = (current  > (anchor + Math.max(1, radius))),
          compact = this.props.compact,
          index = {},
          children = []
      if (compact) {
        showArrows = false
      }

      if (showLeftSeparator) {
        totalShowing--
      }
      if (showRightSeparator) {
        totalShowing--
      }

      var i
      // starting anchor
      for (i=1; i<=anchor && i<=totalPages; i++) {
        children.push(i)
        index[i] = children.length
      }

      // radius
      for (i=min; i<=max; i++) {
        if (!index[i]) {
          children.push(i)
          index[i] = children.length
        }
      }

      // upper anchor
      for (i=Math.max(totalPages-anchor+1, current+1); i<=totalPages; i++) {
        if (!index[i]) {
          children.push(i)
          index[i] = children.length
        }
      }

      // always keep the same number of indicators showing - start down from middle
      for (i=current; i > 0 && children.length < totalShowing; i--) {
        if (typeof index[i] === 'undefined') {
          _idx = index[i+1]-1
          children.splice(_idx, 0, i)
          index[i] = _idx+1
        }
      }
      for (i=current; children.length < totalShowing && children.length < totalPages; i++) {
        if (!index[i]) {
          children.splice(i-1, 0, i)
        }
      }

      // map the children to components
      var self = this
      children = children.map(function(child) {
        if (child === current) {
          return React.DOM.div({className: 'active item'}, child)
        } else {
          return React.DOM.a({className: 'item', href: '#' + child, onClick: eventBinder(child, 'onChange', self, true)}, child)
        }
      })

      // separators
      if (showLeftSeparator) {
        if (compact) {
          children.splice(anchor, 0, React.DOM.a({className: 'icon item'}, React.DOM.i({className: 'left arrow icon', onClick: eventBinder(current-1, 'onChange', self, true)})))
        } else {
          children.splice(anchor, 0, React.DOM.div({className: 'disabled item'}, separator))
        }
      }
      if (showRightSeparator) {
        if (compact) {
          children.splice(children.length-anchor, 0, React.DOM.a({className: 'icon item'}, React.DOM.i({className: 'right arrow icon', onClick: eventBinder(current+1, 'onChange', self, true)})))
        } else {
          children.splice(children.length-anchor, 0, React.DOM.div({className: 'disabled item'}, separator))
        }
      }

      // arrows
      if (showArrows) {
        var nodeName, className
        if (current === 1) {
          nodeName = 'div'
          className = 'icon disabled item'
        } else {
          nodeName = 'a'
          className = 'icon item'
        }
        children.splice(0, 0, React.DOM[nodeName]({
          className: className, onClick: current > 1 ? eventBinder(current-1, 'onChange', self, true) : undefined
        }, React.DOM.i({className: 'left arrow icon'})))

        if (current === totalPages) {
          nodeName = 'div'
          className = 'icon disabled item'
        } else {
          nodeName = 'a'
          className = 'icon item'
        }
        children.splice(children.length, 0, React.DOM[nodeName]({
          className: className, onClick: current < totalPages ? eventBinder(current+1, 'onChange', self, true) : undefined
        }, React.DOM.i({className: 'right arrow icon'})))
      }

      return React.DOM.div({className: 'ui pagination menu'}, children)

    } else {
      return React.DOM.div()
    }
  }
}