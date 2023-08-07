/**
 * Author:        Kewal Rathod
 * Created:       04.08.2023
 * License:       MIT
 * Description:   A simple, useless, lightweight, customizable, searchable, multi-select dropdown component build with pure JavaScript and CSS. * 
 **/

"use strict"

function VirtualList(config) {
  var root = config.root || document

  var width = (config && config.w + "px") || "100%"
  var height = (config && config.h + "px") || "100%"
  var itemHeight = (this.itemHeight = config.itemHeight)
  var type = config?.type

  this.items = config.items
  this.generatorFn = config.generatorFn
  this.totalRows = config.totalRows || (config.items && config.items.length)

  var scroller = VirtualList.createScroller(itemHeight * this.totalRows)
  this.container = VirtualList.createContainer(config.container, width, height)
  this.container.appendChild(scroller)

  var screenItemsLen = Math.ceil(config.h / itemHeight)
  this.cachedItemsLen = screenItemsLen * 3
  this._renderChunk(this.container, 0)

  var self = this
  var lastRepaintY
  var maxBuffer = screenItemsLen * itemHeight
  var lastScrolled = 0

  // As soon as scrolling has stopped, this interval asynchronously removes all the nodes that are not used anymore
  // Can cause jumps on slower devices i feel
  this.rmNodeInterval = setInterval(function () {
    if (Date.now() - lastScrolled > 100) {
      var badNodes = root.querySelectorAll('[data-rm="1"]')
      for (var i = 0, l = badNodes.length; i < l; i++) {
        self.container.removeChild(badNodes[i])
      }
    }
  }, 300)

  function onScroll(e) {
    var scrollTop = e.target.scrollTop // Triggers reflow
    if (!lastRepaintY || Math.abs(scrollTop - lastRepaintY) > maxBuffer) {
      var first = parseInt(scrollTop / itemHeight) - screenItemsLen
      self._renderChunk(self.container, first < 0 ? 0 : first)
      lastRepaintY = scrollTop
    }

    lastScrolled = Date.now()
    e.preventDefault && e.preventDefault()
  }

  this.container.addEventListener("scroll", onScroll)
}

VirtualList.prototype.createRow = function (i) {
  var item
  if (this.generatorFn) item = this.generatorFn(i, this.items[i])
  else if (this.items) {
    // Check if the item is still available in the list
    if (this.items[i] === undefined) {
      // Create an empty placeholder for the removed item to avoid white space
      item = document.createElement("div")
      item.style.height = this.itemHeight + "px"
    } else if (typeof this.items[i] === "string") {
      var itemText = document.createTextNode(this.items[i])
      item = document.createElement("div")
      item.style.height = this.itemHeight + "px"
      item.appendChild(itemText)
    } else {
      item = this.items[i]
    }
  }

  item.classList.add("vrow")
  item.style.position = "absolute"
  item.style.top = i * this.itemHeight + "px"
  item.style.height = this.itemHeight + "px"
  return item
}

VirtualList.prototype._renderChunk = function (node, from) {
  var finalItem = from + this.cachedItemsLen
  if (finalItem > this.totalRows) finalItem = this.totalRows

  // Append all the new rows in a document fragment that we will later append to the parent node
  var fragment = document.createDocumentFragment()
  for (var i = from; i < finalItem; i++) {
    fragment.appendChild(this.createRow(i))
  }

  // Hide and mark obsolete nodes for deletion.
  for (var j = 1, l = node.childNodes.length; j < l; j++) {
    node.childNodes[j].style.display = "none"
    node.childNodes[j].setAttribute("data-rm", "1")
  }
  node.appendChild(fragment)
}

VirtualList.createContainer = function (t, w, h) {
  var c = t ?? document.createElement("div")
  c.style.width = w
  c.style.height = h
  c.style.overflow = "auto"
  c.style.position = "relative"
  c.style.padding = 0
  return c
}

VirtualList.createScroller = function (h) {
  var scroller = document.createElement("div")
  scroller.style.opacity = 0
  scroller.style.position = "absolute"
  scroller.style.top = 0
  scroller.style.left = 0
  scroller.style.width = "1px"
  scroller.style.height = h + "px"
  return scroller
}

VirtualList.prototype.updateItems = function (items) {
  this.items = items
  this.totalRows = items.length

  var container = this.container
  var scrollTop = container.scrollTop
  var firstVisibleIndex = Math.floor(scrollTop / this.itemHeight)

  var childNodes = container.childNodes
  for (var i = childNodes.length - 1; i >= 0; i--) {
    var itemIndex = parseInt(childNodes[i].style.top) / this.itemHeight
    if ((itemIndex >= this.totalRows || itemIndex < 0) && itemIndex !== 0) {
      container.removeChild(childNodes[i])
    }
  }

  var newContainerHeight = this.totalRows * this.itemHeight
  container.firstChild.style.height = newContainerHeight + "px"

  var screenItemsLen = Math.ceil(container.clientHeight / this.itemHeight)
  var first = firstVisibleIndex - Math.ceil(screenItemsLen / 2)
  if (first < 0) {
    first = 0
  }

  this._renderChunk(container, first)

  container.scrollTop = scrollTop
}
