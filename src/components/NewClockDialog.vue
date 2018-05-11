<template>
  <div id="dialog-container" @click="close" @keyup.esc="close">
    <div id="dialog" @click.stop="" @keyup.enter="submit">
      <div class="dialog-heading">Enter location or time zone ID:</div>
      <input type="text" id="clock-name" v-model="clock" placeholder="e.g. 'Paris, FR' or 'Australia/Melbourne'" />
      <div id="error" v-if="errorText">{{ errorText }}</div>
      <div>
        <input type="checkbox" id="primary" v-model="isPrimary"/><label for="primary">Primary timezone?</label>
      </div>
      <div id="options">
        <div id="cancelbutton" class="button" @click.stop="close"></div>
        <div id="okbutton" class="button" @click.stop="submit"></div>
      </div>
    </div>
  </div>
</template>



<script>
import axios from 'axios'

const API_KEY = 'AIzaSyDakZpCfhQ0_GFp5mzSlsFBtoqMFdT8Xmk'

export default {
  name: 'NewClockDialog',
  props: ['dialogVisible'],
  data: function () {
    return {
      clock: null,
      isPrimary: false,
      errorText: null
    }
  },
  methods: {
    close: function () {
      this.$emit('closeClockDialog', {})
    },
    submit: function () {
      if (!this.clock || this.clock.length === 0) {
        this.errorText = 'A location or Zone Id is required.'
        return
      }
      if (this.clock.indexOf('/') !== -1) {
        this.$emit('newClock', {timezone: this.clock, primary: this.isPrimary})
      } else {
        this.fetchLocationDetails(this.clock).then(this.fetchZoneId).then((data) => {
          data.primary = this.isPrimary
          this.$emit('newClock', data)
        }).catch((err) => alert(err.message))
      }
      this.resetFields()
    },

    /**
     * Resets all the fields for this component to a default state.
     */
    resetFields: function () {
      this.clock = null
      this.isPrimary = false
      this.errorText = null
    },

    /**
     * Finds latitude, longitude and country ISO 2 letter code for a location defined as a string using
     * the Google Places API. On failure this method will give feedback via an alert dialog.
     *
     * @param location {string} Where to look up the coordinates for.
     *
     * @return {Object} a map with values for latitude, longitude and country under the keys
     * 'lat', 'long' and 'country' respectively. Latitude and longitude will be numbers,
     * country a two letter string.
     */
    fetchLocationDetails: async function (location) {
      let url = 'https://maps.googleapis.com/maps/api/geocode/json'
      let encodedLocation = encodeURIComponent(location).replace(/%20/g, '+')
      let response = await axios.get(url + '?address=' + encodedLocation + '&key=' + API_KEY)

      if (response.status !== 200) {
        throw new Error('Attempt to get location for ' + location + ' failed: ' + response.status + ': ' +
          response.statusText)
      }
      let apiData = response.data
      if (apiData.error_message) {
        throw new Error('API responded with an error: ' + apiData.error_message)
      }

      let addressComponents = apiData.results[0].address_components
      let countryData = addressComponents[addressComponents.length - 1]
      let geoData = apiData.results[0].geometry.location
      return {
        'lat': geoData.lat,
        'long': geoData.lng,
        'location': addressComponents[0].long_name,
        'country': countryData.short_name
      }
    },

    /**
     * Fetches Time zone ID for a location based on latitude and longitude from Google Timezone API.
     */
    fetchZoneId: async function (coordinates) {
      let url = 'https://maps.googleapis.com/maps/api/timezone/json'
      let coords = coordinates.lat + ',' + coordinates.long
      let epochtime = Date.now() / 1000

      let response = await axios.get(url, {params: {location: coords, timestamp: epochtime, key: API_KEY}})
      if (response.status !== 200) {
        throw new Error('Attempt to get Zone ID failed: ' + response.status + ': ' + response.statusText)
      }

      let apiData = response.data
      if (apiData.error_message) {
        throw new Error('API responded to Zone ID lookup with an error: ' + apiData.error_message)
      }
      if (apiData.status !== 'OK') {
        throw new Error('API responded to Zone ID lookup with response status of: ' + apiData.status)
      }

      coordinates.timezone = apiData.timeZoneId
      return coordinates
    }
  }
}
</script>

<style>
#dialog-container {
  display: grid;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background: transparent;
  z-index: 3;
}

#dialog {
  font-size: 2.75rem;
  z-index: 4;
  margin: auto;
}

.dialog-heading {
  margin-bottom: 2vh;
  /*border-bottom: 1px solid white;*/
}

input[type=checkbox] {
  border: 1px solid white;
  border-radius: 0%;
  background-color: black;
  height: 2rem;
  width: 2rem;
}

input.error {
  border-color: red;
  color: red;
}
#error {
  color: red;
}
#options {
  text-align: center;
}

#cancelbutton {
  cursor: pointer;
  width: 4rem;
  height: 4rem;
  margin: 1rem;
  display: inline-block;
}
#cancelbutton:before, #cancelbutton:after {
  position: absolute;
  width: 0.5rem;
  height: 4rem;
  background-color: darkred;
  content: ' ';
}
#cancelbutton:before {
  transform: rotate(45deg);
}
#cancelbutton:after {
  transform: rotate(-45deg);
}
#okbutton {
  width: 3rem;
  height: 3rem;
  border-radius: 100%;
  border: 0.5rem solid darkgreen;
  cursor: pointer;
  margin: 1rem;
  display: inline-block;
}

</style>