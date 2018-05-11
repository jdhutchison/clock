<template>
  <div id="app">
    <div id="menubutton" v-on:click="toggleMenu">
      <div class="bar1"></div>
      <div class="bar2"></div>
      <div class="bar3"></div>
    </div>

    <app-menu
        v-if="displayMenu"
        v-bind:settings="settings"
        v-bind:primary-clock="primaryClock"
        v-on:close-menu="toggleMenu"
        v-on:show-new-clock-dialog="toggleDialog"
        v-on:show-utc="changeSetting('showUtc', $event)"
        v-on:set-sort-order="changeSetting('sortOrder', $event)"
        v-on:clear-primary-clock="clearCurrentPrimaryClock"
    ></app-menu>

    <clock-menu v-if="displayClockMenu"
        v-bind:clock="clocks[currentClockId - 1]"
        v-bind:primary-clock="primaryClock"
        v-on:close-clock-menu="toggleClockMenu"
        v-on:make-primary="makePrimary($event)"
        v-on:delete-clock="deleteClock($event)"
        v-on:set-new-clock-name="setName(currentClockId, $event)"
    ></clock-menu>

    <new-clock-dialog
        v-if="dialogVisible"
        v-on:newClock="addClock($event)"
        v-on:closeClockDialog="toggleDialog"
    ></new-clock-dialog>

    <clock v-if="settings.showUtc"
           v-bind:model="utc"
           v-bind:time="time"
           v-bind:primaryClock="primaryClock"
           v-bind:settings="settings"
           v-bind:row-class="rowClass"
    >
    </clock>
    <clock v-on:clock-clicked="toggleClockMenu"
        v-for="(clock, index) in clocksForDisplay"
        v-bind:time="time"
        v-bind:primaryClock="primaryClock"
        v-bind:model="clock"
        v-bind:settings="settings"
        v-bind:row-class="rowClass"
        v-bind:key="index"
    ></clock>
  </div>
</template>

<script>
import Clock from './components/Clock.vue'
import NewClockDialog from './components/NewClockDialog.vue'
import ClockModel from './models/ClockModel.js'
import AppMenu from './components/AppMenu.vue'
import ClockMenu from './components/ClockMenu.vue'

const DATA_STORAGE_KEY = 'clockData'
const SETTINGS_STORAGE_KEY = 'clockSettings'
const UTC_CLOCK = new ClockModel({timezone: 'utc', location: 'UTC'})
const DEFAULT_SETTINGS = {showUtc: true, sortOrder: 'offsetDesc', groupClocks: false}

// Sorting functions
const NATURAL_SORT = (c1, c2) => c1.id - c2.id
const OFFSET_DESC_SORT = (c1, c2) => c2.offset - c1.offset
const OFFSET_ASC_SORT = (c1, c2) => OFFSET_DESC_SORT(c2, c1)
const NAME_SORT = function (c1, c2) {
  if (c1.getDisplayName() > c2.getDisplayName()) {
    return 1
  } else if (c1.getDisplayName() < c2.getDisplayName()) {
    return -1
  } else {
    return 0
  }
}

export default {
  name: 'App',
  components: {
    clockMenu: ClockMenu,
    clock: Clock,
    newClockDialog: NewClockDialog,
    appMenu: AppMenu
  },
  data: function () {
    return {
      clocks: [],
      settings: DEFAULT_SETTINGS,
      time: Date.now(),
      dialogVisible: false,
      displayMenu: false,
      displayClockMenu: false,
      currentClockId: null,
      utc: UTC_CLOCK
    }
  },
  computed: {
    clocksForDisplay: function () {
      return this.sortClocks(this.clocks, this.settings.sortOrder)
    },
    primaryClock: function () {
      return this.clocks.find((clock) => clock.primary)
    },
    rowClass: function () {
      let offsets = 0
      if (this.settings.showUtc) {
        offsets += 1
      }
      if (this.primaryClock) {
        offsets += 1
      }
      return 'clock-' + offsets
    },
    groups: function () {
      if (!this.settings.groupClocks) {
        return null
      }
      var groups = {}
      for (var i = 0; i < this.clocks.length; i++) {
        let clock = this.clocksForDisplay[i]
        let offset = clock.offset
        if (!groups[offset]) {
          groups[offset] = []
        }
        groups[offset].push(clock)
      }
      return groups
    }
  },
  created: function () {
    let storedData = window.localStorage.getItem(DATA_STORAGE_KEY)
    if (storedData) {
      var parsedClockData = JSON.parse(storedData)
      this.clocks = parsedClockData.map((c) => new ClockModel(c))
    }
    let storedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (storedSettings && storedSettings.trim().length > 0) {
      this.settings = JSON.parse(storedSettings)
    }
    setInterval(this.updateTime, 1000)
  },
  methods: {
    /**
     * Adds a new clock to the display. The input array requires the following
     * attributes:
     *  - timezone {String}
     *  - primary {boolean}
     *
     *  It can also have the following optional attributes
     *  - location {String}
     *  - coordinates {Object}
     *  - country {String}
     *  - name {String}
     *
     *  The new clock will be assigned an id.
     *
     *  @param clockData {Object} data for the new clock.
     */
    addClock: function (clockData) {
      // De-flag the current primary clock if this is a new primary clock
      if (clockData.primary) {
        this.clearCurrentPrimaryClock()
      }
      let clock = new ClockModel(clockData)
      clock.id = this.clocks.length + 1
      this.clocks.push(clock)
      window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(this.clocks))
      this.toggleDialog()
    },

    /**
     * Removes a clock from the system and adjusts all remaining clock with a higher
     * id so their id is one less, avoiding gaps i the id sequence.
     *
     * @param clockId {Number} the id of the clock to remove.
     */
    deleteClock: function (clockId) {
      this.clocks.splice(clockId - 1, 1)
      for (var i = clockId - 1; i < this.clocks.length; i++) {
        this.clocks[i].id -= 1
      }
      window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(this.clocks))
      this.toggleClockMenu()
    },

    /**
     * Changes the value of any setting and writes all settings out to local storage.
     *
     * @param setting {String} the name of the seeting to modify
     * @param value {*} the new vslue for the setting being modofied. Can be anything.
     */
    changeSetting: function (setting, value) {
      this.settings[setting] = value
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings))
      this.toggleMenu()
    },

    /**
     * Looks for any clock marked as the primary and if one exists then
     * set primary flag to false.
     */
    clearCurrentPrimaryClock: function () {
      let primary = this.clocks.find((c) => c.primary)
      if (primary) {
        primary.primary = false
      }
      window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(this.clocks))
      this.toggleMenu()
    },

    /**
     * Designates a clock as the primary, based on its id. If the id matches no existing clock then
     * nothing happens. Else the existing primary clock is replaced.
     *
     * @param clockId {integer} The id of the clock to become the primary.
     */
    makePrimary: function (clockId) {
      let primary = this.clocks.find((c) => c.primary)
      if (primary) {
        primary.primary = false
      }
      this.clocks[clockId - 1].primary = true
      window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(this.clocks))
      this.toggleClockMenu()
    },

    /**
     * Sets the name of a clock with a given id. If the clock id is valid then
     * the matching clock gets a new name and the clocks are written to local storage.
     *
     * @param clockId {integer} the id of the clock to update
     * @param newName {String} the new name for the clock.
     */
    setName: function (clockId, newName) {
      let clock = this.clocks[clockId - 1]
      if (clock) {
        clock.name = newName
        window.localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(this.clocks))
      }
    },

    /**
     * Adjusts the current time used for all clock displays.
     */
    updateTime: function () {
      this.time = Date.now()
    },

    toggleMenu: function () {
      this.displayMenu = !this.displayMenu
      this.toggleOverlay()
    },

    toggleClockMenu: function (clockId) {
      this.currentClockId = clockId
      this.displayClockMenu = !this.displayClockMenu
      this.toggleOverlay()
    },

    toggleDialog: function () {
      if (!this.dialogVisible) {
        this.toggleMenu()
      }
      this.dialogVisible = !this.dialogVisible
      this.toggleOverlay()
    },

    toggleOverlay: function () {
      let currentState = document.getElementById('overlay').style.display
      let newState = (currentState !== 'block') ? 'block' : 'none'
      document.getElementById('overlay').style.display = newState
    },

    /**
     * Sorts all the clocks based on a given sort function. If one of the clocks
     * is marked as the primary then it will be inserted at the start of the
     * sorted array.
     *
     * The array returned by sorted is a new array. THe input array is not
     * altered.
     *
     * @param clocks {array} the array of clocks (ClockModels) to sort.
     * @param sortOrder {string} what to sort by. One of offsetDesc, offsetAsc, name or natural.
     * @returns {array} a new array of the sorted clocks.
     */
    sortClocks: function (clocks, sortOrder) {
      let sorted = clocks.slice()
      if (sortOrder === 'offsetDesc') {
        sorted.sort(OFFSET_DESC_SORT)
      } else if (sortOrder === 'offsetAsc') {
        sorted.sort(OFFSET_ASC_SORT)
      } else if (sortOrder === 'name') {
        sorted.sort(NAME_SORT)
      } else {
        sorted.sort(NATURAL_SORT)
      }

      let primary = sorted.find((c) => c.primary)
      if (primary) {
        sorted.splice(sorted.findIndex((c) => c.primary), 1)
        sorted.splice(0, 0, primary)
      }
      return sorted
    }
  }
}
</script>

<style>
div#app {
  width: 70%;
  margin: 0 auto;
}

div#menubutton {
  position: absolute;
  top: 3%;
  left: 75%;
  display: inline-block;
  cursor: pointer;
}

.bar1, .bar2, .bar3 {
  width: 35px;
  height: 5px;
  background-color: #FFF;
  margin: 6px 0;
  transition: 0.4s;
}

@media screen and (max-width: 1365px) {
  div#app {
    width: 90%;
    margin: auto;
  }
}

@media screen and (max-width: 500px){
  div#menubutton {
    right: 0;
    top: 0;
  }
}

@media screen and (max-width: 1080px) and (min-width: 501px){
  div#app {
    width: 100%;
    margin: auto;
  }
}
</style>
