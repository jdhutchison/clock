<template>
  <div id="clock-menu" class="menu">
    <a class="menu-closebutton" @click="$emit('close-clock-menu')" href="#"></a>
    <template v-if="!editingName">
      <div class="menu-items">
        <div class="clockheading">{{ clock.getDisplayName() }}</div>
        <div class="menuitem" v-if="!primaryClock || primaryClock.id !== clock.id"
             @click="$emit('make-primary', clock.id)">
          Make this clock Primary
        </div>
        <div class="menuitem" @click="editingName = true">Change display name of this clock</div>
        <div class="menuitem" @click="$emit('delete-clock', clock.id)">Delete this clock</div>
      </div>
    </template>
    <template v-else>
      <div id="clock-name-editor" @click.stop="" @keyup.enter="submit">
        <div class="menuheading">Enter a new name for {{ clock.getDisplayName() }}:</div>
        <input type="text" id="new-clock-name"  placeholder="New name e.g. 'Bern, CH'" />
        <div id="options">
          <div id="cancelbutton" class="button" @click.stop="cancelNewName"></div>
          <div id="okbutton" class="button" @click.stop="submit"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ClockMenu',
  props: ['clock', 'primaryClock'],
  data: function () {
    return {
      editingName: false
    }
  },
  methods: {
    cancelNewName: function () {
      this.editingName = false
    },
    submit: function () {
      let newValue = document.getElementById('new-clock-name').value
      if (newValue) {
        this.$emit('set-new-clock-name', newValue)
      }
      this.editingName = false
    }
  }
}
</script>

<style>
.clockheading {
  font-size: 3rem;
  border-bottom: 1px dashed white;
}

#clock-name-editor {
  margin: auto;
}


</style>

