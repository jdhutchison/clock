<template>
  <div id="app-menu" class="menu">
    <a class="menu-closebutton" @click="$emit('close-menu')" href="#"></a>
    <div class="menu-items">
      <div class="menuitem" @click="$emit('show-new-clock-dialog')">Add new clock</div>
      <div class="menuitem" v-if="!settings.showUtc" @click="$emit('show-utc', true)">Show UTC</div>
      <div class="menuitem" v-if="settings.showUtc" @click="$emit('show-utc', false)">Hide UTC</div>
      <div class="menuitem" v-if="primaryClock" @click="$emit('clear-primary-clock')">Clear Primary clock</div>
      <div class="menuheading">Sort clocks by:</div>
      <div v-bind:class="[settings.sortOrder === 'natural' ? 'highlightedsubitem' : 'menusubitem' ]"
           @click="$emit('set-sort-order', 'natural')">Creation
        order</div>
      <div v-bind:class="[settings.sortOrder === 'name' ? 'highlightedsubitem' : 'menusubitem' ]"
           @click="$emit('set-sort-order', 'name')">Name</div>
      <div v-bind:class="[settings.sortOrder === 'offsetDesc' ? 'highlightedsubitem' : 'menusubitem' ]"
           @click="$emit('set-sort-order', 'offsetDesc')">UTC Offset
        descending</div>
      <div v-bind:class="[settings.sortOrder === 'offsetAsc' ? 'highlightedsubitem' : 'menusubitem' ]"
           @click="$emit('set-sort-order', 'offsetAsc')">UTC Offset
        ascending</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppMenu',
  props: ['settings', 'primaryClock'],
  data: function () {
    return { }
  },
  methods: {
  }
}
</script>

<style>
.highlightedsubitem {
  font-size: 2rem;
  margin-left: 2rem;
  color: #FFA500;
}
</style>