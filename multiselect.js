/**
 * Author:        Kewal Rathod
 * Created:       04.08.2023
 * License:       MIT
 * Description:   A simple, useless, lightweight, customizable, searchable, multi-select dropdown component build with pure JavaScript and CSS. *
 **/

"use strict"

function MultiSelect(props) {
  // External Props Settings
  this.root = props.rootElement
  this.itemList = props.items
  this.height = props.height || 400
  this.collapseChipCount = props.collapseChipCount || 5
  this.expandChipCount = props.expandChipCount || 50
  this.mode = props.mode || "multi"
  this.labelKey = props.labelKey || "label"
  this.valueKey = props.valueKey || "value"
  this.placeholder = props.placeholder || "Select Options"
  this.disabled = props.disabled || false
  this.disabledFields = props.disabledFields || []

  // Internal Props Settings
  this.chipCollapse = true

  // Array to Store Selected & Unselected Items.
  this.selectedItems = []
  this.unselectedItems = Array.isArray(this.itemList) ? this.itemList.slice() : []
  // TODO: Handle This Error Properly As It May Crash Rest of The Code.
  if (!Array.isArray(this.itemList)) console.error("Item List should be an array.", this.root)

  this.initialize()
}

MultiSelect.prototype.initialize = function () {
  this.generateDOM()
  this.setupDOM()
  this.renderLists()
  this.setupEventListeners()
}

MultiSelect.prototype.generateDOM = function () {
  this.container = document.createElement("div")
  this.container.classList.add("MultiSelectContainer")

  // Outer Trigger Button
  const button = document.createElement("button")
  button.type = "button"
  button.classList.add("PopoverBtn")

  if (this.disabled) button.classList.add("Disabled")

  const selectOptions = document.createElement("div")
  selectOptions.classList.add("SelectOptions")
  selectOptions.textContent = this.placeholder
  button.appendChild(selectOptions)

  const downArrowCont = document.createElement("div")
  downArrowCont.classList.add("DropdownIconCont")

  const downArrow = document.createElement("img")
  downArrow.src = "./assets/dropdown.svg"
  downArrow.alt = "down-arrow"
  downArrow.classList.add("DownArrow")
  downArrowCont.appendChild(downArrow)

  button.appendChild(downArrowCont)

  // Popover Container & Content
  const popperContainer = document.createElement("div")
  popperContainer.classList.add("PopperContainer", "Detach")

  const popoverContent = document.createElement("div")
  popoverContent.classList.add("PopoverContent")

  // Popover Header
  const listHeader = document.createElement("div")
  listHeader.classList.add("ListHeader")

  // Selected Items List
  const chipsList = document.createElement("div")
  chipsList.classList.add("ChipsList", "SelectedItemsList")
  listHeader.appendChild(chipsList)

  // Search Panel
  const searchPanel = document.createElement("div")
  searchPanel.classList.add("SearchPanel")

  const searchPrefix = document.createElement("img")
  searchPrefix.src = "./assets/search.svg"
  searchPrefix.classList.add("SearchPrefix")
  searchPrefix.width = 14
  searchPrefix.height = 14
  searchPanel.appendChild(searchPrefix)

  const searchInput = document.createElement("input")
  searchInput.type = "text"
  searchInput.classList.add("SearchInput")
  searchInput.placeholder = "Search"
  searchPanel.appendChild(searchInput)

  const loader = document.createElement("div")
  loader.classList.add("Loader")
  searchPanel.appendChild(loader)

  listHeader.appendChild(searchPanel)

  popoverContent.appendChild(listHeader)

  // Unselected Items List
  const unselectedItemsList = document.createElement("div")
  unselectedItemsList.classList.add("MultiSelectList", "UnselectedItemsList")
  popoverContent.appendChild(unselectedItemsList)

  if (this.mode === "multi") {
    // List Footer
    const listFooter = document.createElement("div")
    listFooter.classList.add("ListFooter")

    const selectAllBtn = document.createElement("button")
    selectAllBtn.type = "button"
    selectAllBtn.classList.add("SelectAllBtn")
    selectAllBtn.textContent = "Select All"
    listFooter.appendChild(selectAllBtn)

    const clearAllBtn = document.createElement("button")
    clearAllBtn.type = "button"
    clearAllBtn.classList.add("ClearAllBtn")
    clearAllBtn.textContent = "Clear All"
    listFooter.appendChild(clearAllBtn)

    popoverContent.appendChild(listFooter)
  }

  // Backdrop
  const backdrop = document.createElement("div")
  backdrop.classList.add("Backdrop")

  // Append All Elements to the Container
  this.container.appendChild(button)
  popperContainer.appendChild(popoverContent)
  popperContainer.appendChild(backdrop)
  this.container.appendChild(popperContainer)

  // Append Container to the Root Element
  const rootContainer = typeof this.root === "string" ? document.querySelector(`${this.root}`) : this.root
  this.rootContainer = rootContainer
  rootContainer.appendChild(this.container)
}

MultiSelect.prototype.setupDOM = function () {
  // Setup DOM Once DOM Elements are generated.
  const rootContainer = this.rootContainer
  this.popoverBtn = rootContainer.querySelector(".PopoverBtn")

  const popperContainer = rootContainer.querySelector(".PopperContainer")
  this.popperContainer = popperContainer
  this.unselectedItemsContainer = popperContainer.querySelector(".UnselectedItemsList")
  this.selectedItemsContainer = popperContainer.querySelector(".SelectedItemsList")
  this.searchInput = popperContainer.querySelector(".SearchInput")
  this.popoverContent = popperContainer.querySelector(".PopoverContent")
  this.backdropElement = popperContainer.querySelector(".Backdrop")

  if (this.mode === "multi") {
    this.selectAllBtn = popperContainer.querySelector(".SelectAllBtn")
    this.clearAllBtn = popperContainer.querySelector(".ClearAllBtn")
  }
}

MultiSelect.prototype.setupEventListeners = function () {
  const self = this

  function TogglePopover() {
    const isOpen = self.popoverContent.classList.contains("Show")

    if (!isOpen) {
      document.body.appendChild(self.popperContainer)
      self.positionPopoverContent()
    }

    self.popoverContent.classList.toggle("Show", !isOpen)
    self.backdropElement.classList.toggle("Show", !isOpen)
  }

  // Handle click events using event delegation

  this.rootContainer.addEventListener("click", function (event) {
    if (self.disabled) return

    console.info("event.target", event.target.classList, event.target.parentNode, event.target.parentNode.parentNode)
    if (event.target.classList.contains("ChipOverflow")) {
      const isOuterChip = event.target.classList.contains("OuterFlow")
      self.chipCollapse = !self.chipCollapse
      self.renderSelectedItems(isOuterChip)
    } else if (event.target.closest(".PopoverBtn")) {
      TogglePopover()
    }
  })

  this.popperContainer.addEventListener("click", function (event) {
    if (self.disabled) return
    console.info("event.target", event.target.classList, event.target.parentNode, event.target.parentNode.parentNode)

    if (event.target.classList.contains("ChipOverflow")) {
      const isOuterChip = event.target.classList.contains("OuterFlow")
      self.chipCollapse = !self.chipCollapse
      self.renderSelectedItems(isOuterChip)
    } else if (event.target.classList.contains("VItem")) {
      self.handleItemSelection(event.target)
    } else if (event.target.classList.contains("VItemCrossIcon")) {
      self.handleItemUnselection(event.target.closest(".VItem"))
    } else if (self.mode === "multi" && event.target === self.selectAllBtn) {
      self.selectAllItems()
    } else if (self.mode === "multi" && event.target === self.clearAllBtn) {
      self.clearAllItems()
    } else if (event.target === self.backdropElement) {
      self.handleBackDrop()
    }
  })

  // Handle Search Functionality
  this.searchInput.addEventListener("input", function () {
    self.onSearch(true)
  })
}

MultiSelect.prototype.addTooltipToElement = function (element, content) {
  const tooltip = document.createElement("div")
  tooltip.classList.add("Tooltip")
  tooltip.innerHTML = content
  tooltip.style.display = "none"

  element.addEventListener("mouseenter", () => {
    const rect = element.getBoundingClientRect()
    const tooltipWidth = tooltip.offsetWidth
    const tooltipHeight = tooltip.offsetHeight

    const tooltipX = rect.right + 8
    const tooltipY = rect.top - tooltipHeight / 2 + rect.height / 2 - 10

    tooltip.style.left = tooltipX + "px"
    tooltip.style.top = tooltipY + "px"
    tooltip.style.display = "block"
    document.body.appendChild(tooltip)
  })

  element.addEventListener("click", () => {
    tooltip.style.display = "none"
    tooltip.remove()
  })

  element.addEventListener("mouseleave", () => {
    tooltip.style.display = "none"
    tooltip.remove()
  })

  return tooltip
}

MultiSelect.prototype.outerChipInjection = function () {
  const outerContainer = document.createElement("div")
  outerContainer.classList.add("ChipsList", "SelectedItemsList", "Outer")

  const selectedItemElement = document.createElement("div")
  selectedItemElement.classList.add("VItem")
  selectedItemElement.innerHTML = `<span class="VItemLabel">${this.selectedItems[0][this.labelKey]}</span>`
  outerContainer.appendChild(selectedItemElement)

  if (this.selectedItems.length > 1) {
    const overflowChip = document.createElement("div")
    overflowChip.classList.add("VItem", "ChipOverflow", "OuterFlow")
    overflowChip.textContent = "+" + (this.selectedItems.length - 1)
    outerContainer.appendChild(overflowChip)

    const tooltipContent = this.selectedItems.map((item) => item[this.labelKey]).join("\n")
    this.addTooltipToElement(overflowChip, tooltipContent)
  }

  this.popoverBtn.appendChild(outerContainer)
}

MultiSelect.prototype.positionPopoverContent = function () {
  // Calculate the position of the popover content relative to the popover button
  const targetRect = this.popoverBtn.getBoundingClientRect()
  const contentWidth = this.popoverContent.offsetWidth
  const contentHeight = this.popoverContent.offsetHeight

  const contentX = targetRect.left
  const contentY = targetRect.bottom + 4

  this.popoverContent.style.position = "absolute"
  this.popoverContent.style.left = contentX + "px"
  this.popoverContent.style.top = contentY + "px"
}

MultiSelect.prototype.handleBackDrop = function () {
  console.info("Backdrop Triggered")
  this.popoverContent.classList.remove("Show")
  this.backdropElement.classList.remove("Show")

  // Remove popperContainer from body & add it to the root container
  this.popperContainer.remove()
  this.container.appendChild(this.popperContainer)

  const lastChild = this.popoverBtn.querySelector(".DropdownIconCont")
  console.info("lastChild", lastChild)

  this.popoverBtn.textContent = ""

  if (this.selectedItems.length === 0) {
    const outerText = document.createElement("div")
    outerText.textContent = this.placeholder
    outerText.classList.add("SelectOptions")
    this.popoverBtn.appendChild(outerText)
  } else {
    this.outerChipInjection()
  }

  this.popoverBtn.appendChild(lastChild)
}

MultiSelect.prototype.handleItemSelection = function (element) {
  const selectedItemText = element.textContent.trim()
  const selectedItemIndex = this.unselectedItems.findIndex((x) => x[this.labelKey] === selectedItemText)
  const selectedItemValue = this.unselectedItems[selectedItemIndex][this.valueKey]

  if (this.disabledFields.includes(selectedItemValue)) {
    return // Disable selection
  }

  if (selectedItemIndex !== -1) {
    // Move Item From Unselected to Selected Items List
    if (this.mode === "single") {
      this.selectedItems = [this.unselectedItems[selectedItemIndex]] // Single select mode
      this.handleBackDrop()
    } else {
      this.selectedItems.splice(0, 0, this.unselectedItems[selectedItemIndex])
    }

    this.unselectedItems.splice(selectedItemIndex, 1)

    // Update UI - Move Items From Unselected to Selected Items VirtualList
    const selectedItemElement = document.createElement("div")
    selectedItemElement.classList.add("VItem")
    selectedItemElement.innerHTML = `<span class="VItemLabel">${selectedItemText}</span>`
    const crossIcon = document.createElement("img")
    crossIcon.classList.add("VItemCrossIcon")
    crossIcon.src = "./assets/cross.svg"
    selectedItemElement.appendChild(crossIcon)
    this.selectedItemsContainer.appendChild(selectedItemElement)

    element.remove()
    if (this.searchInput.value.trim() !== "") {
      this.onSearch(false)
    } else {
      this.virtualList.updateItems(this.unselectedItems)
      this.renderSelectedItems()
      this.handleNoItems()
    }
  }
}

MultiSelect.prototype.handleItemUnselection = function (element) {
  const chipItem = element.querySelector(".VItemLabel")

  if (chipItem) {
    const selectedItemText = chipItem.textContent.trim()
    const selectedItemIndex = this.selectedItems.findIndex((x) => x[this.labelKey] === selectedItemText)

    if (selectedItemIndex !== -1) {
      // Move item from selected to unselected array
      // Original Index = this.selectedItems[selectedItemIndex].index
      this.unselectedItems.splice(0, 0, this.selectedItems[selectedItemIndex])
      this.selectedItems.splice(selectedItemIndex, 1)

      element.remove()
      this.virtualList.updateItems(this.unselectedItems)
      this.renderSelectedItems()
      this.handleNoItems()
    }
  }
}

MultiSelect.prototype.renderLists = function () {
  const currentScrollPosition = this.unselectedItemsContainer.scrollTop
  const firstVisibleIndex = Math.floor(currentScrollPosition / 40)
  console.info("Trigger Rendering :", this.disabledFields)

  this.virtualList = new VirtualList({
    root: this.popoverContent,
    container: this.unselectedItemsContainer,
    h: this.height,
    itemHeight: 40,
    items: this.unselectedItems,
    generatorFn: (index, row) => {
      const value = row[this.valueKey]

      let el = document.createElement("div")
      el.classList.add("VItem")
      el.innerHTML = row[this.labelKey]
      el.setAttribute("data-index", index)
      el.setAttribute("data-value", value)
      if (this.disabledFields.includes(value)) el.setAttribute("disabled", true)
      return el
    },
  })
  this.unselectedItemsContainer.scrollTop = firstVisibleIndex * 40

  this.virtualList.container.classList.add("VirtualListContainer")

  this.handleNoItems()

  this.renderSelectedItems() // Re-render Selected Items List
}

// Used for Popover Selected List i.e, Chips and Outer Overflow Chips.
// Not used for Default Chips. That is done via outerChipInjection()

MultiSelect.prototype.renderSelectedItems = function (isOuterChip = false) {
  const containerItem = isOuterChip ? this.popoverBtn.querySelector(".ChipsList") : this.selectedItemsContainer
  containerItem.innerHTML = "" // Clear Existing Items
  const collapseLimit = this.chipCollapse ? this.collapseChipCount : this.expandChipCount

  for (let i = 0; i < Math.min(this.selectedItems.length, collapseLimit); i++) {
    const selectedItemElement = document.createElement("div")
    selectedItemElement.classList.add("VItem")
    selectedItemElement.innerHTML = `<span class="VItemLabel">${this.selectedItems[i][this.labelKey]}</span>`
    if (!isOuterChip) {
      const crossIcon = document.createElement("img")
      crossIcon.classList.add("VItemCrossIcon")
      crossIcon.src = "./assets/cross.svg"
      selectedItemElement.appendChild(crossIcon)
    }

    containerItem.appendChild(selectedItemElement)
  }

  if (this.selectedItems.length > collapseLimit) {
    const overflowItems = this.selectedItems.slice(collapseLimit)
    const overflowChip = document.createElement("div")
    overflowChip.classList.add("VItem", "ChipOverflow")
    overflowChip.textContent = "+" + (this.selectedItems.length - collapseLimit)
    containerItem.appendChild(overflowChip)

    const tooltipContent = overflowItems.map((item) => item[this.labelKey]).join("\n")
    this.addTooltipToElement(overflowChip, tooltipContent)
  }
}

MultiSelect.prototype.selectAllItems = function () {
  if (this.selectedItems.length === this.itemList.length) return

  this.selectedItems = this.selectedItems.concat(this.unselectedItems)
  this.renderSelectedItems()
  this.unselectedItems = []
  this.virtualList.updateItems(this.unselectedItems)

  this.handleNoItems()
}

MultiSelect.prototype.clearAllItems = function () {
  this.searchInput.value = ""

  if (this.unselectedItems.length === this.itemList.length) return

  this.unselectedItems = this.unselectedItems.concat(this.selectedItems)
  this.selectedItems = []
  this.virtualList.updateItems(this.unselectedItems)
  this.renderSelectedItems()
  this.handleNoItems()
}

MultiSelect.prototype.showLoader = function () {
  const loader = this.popperContainer.querySelector(".Loader")
  if (loader) {
    loader.style.display = "block"
  }
}

MultiSelect.prototype.hideLoader = function () {
  const loader = this.popperContainer.querySelector(".Loader")
  if (loader) {
    loader.style.display = "none"
  }
}

MultiSelect.prototype.onSearch = function (throttle = true) {
  const searchText = this.searchInput.value.trim().toLowerCase()
  const delayTime = throttle ? 500 : 0

  if (this.searchTimer) {
    clearTimeout(this.searchTimer)
  }

  if (throttle) {
    // Show the loader while processing
    this.showLoader()
  }

  this.searchTimer = setTimeout(() => {
    const filterItems = this.unselectedItems.filter((x) => x?.[this.labelKey]?.toString().toLowerCase().includes(searchText))
    this.virtualList.updateItems(filterItems)
    this.renderSelectedItems()
    this.handleNoItems()

    // Hide the loader after processing
    this.hideLoader()

    console.info("Search :", this.virtualList.items)
  }, delayTime)
}

MultiSelect.prototype.handleNoItems = function () {
  console.info("No Items :", this.virtualList.items.length, this.unselectedItemsContainer.querySelector(".NoItemsMessage"))
  if (this.virtualList.items.length === 0) {
    const noItemsElement = document.createElement("div")
    noItemsElement.textContent = "No Items"
    noItemsElement.classList.add("NoItemsMessage")
    noItemsElement.textContent = "No Data Found"

    const noDataIcon = document.createElement("img")
    noDataIcon.src = "./assets/nodata.svg"
    noDataIcon.width = 48
    noDataIcon.height = 48

    noItemsElement.prepend(noDataIcon)

    setTimeout(() => {
      this.unselectedItemsContainer.appendChild(noItemsElement)
      this.unselectedItemsContainer.style.height = "auto"
      this.unselectedItemsContainer.classList.add("NoItems")
      if (this.mode === "multi") {
        this.selectAllBtn.classList.add("Inactive")
      }
    }, 150)
  } else if (this.virtualList.items.length !== 0) {
    this.unselectedItemsContainer.style.height = this.height + "px"
    if (this.mode === "multi") {
      this.selectAllBtn.classList.remove("Inactive")
    }
  }
}

// Events

MultiSelect.prototype.setDisabled = function (isDisabled) {
  this.disabled = isDisabled
  this.popoverBtn.classList.toggle("Disabled", isDisabled)
}

MultiSelect.prototype.setDisabledFields = function (fieldValues, isDisabled = true) {
  if (!Array.isArray(fieldValues)) {
    fieldValues = [fieldValues]
  }

  if (isDisabled) {
    this.disabledFields = [...new Set([...this.disabledFields, ...fieldValues])]
  } else {
    this.disabledFields = this.disabledFields.filter((value) => !fieldValues.includes(value))
  }

  this.virtualList.updateItems(this.unselectedItems)
}

MultiSelect.prototype.getDisabledFields = function () {
  return this.disabledFields
}
