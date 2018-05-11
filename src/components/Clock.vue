<template>
  <div v-bind:class="['clock', rowClass, isUtc || model.primary ? 'detailed' : '']" @click="fireClickEvent">
    <div class="flag"><span><img v-if="!isUtc && model.country" :src="flagUrl"/></span></div>
    <div class="clock-main">
      <div class="clock-name">{{ displayName }}
        <span v-if="!isUtc" class="clock-details dimmed">({{ commontzname }})</span>
        <template v-if="isUtc || model.primary">
          <span class="clock-details">
            <b>{{ datestring }}</b>
          </span>
        </template>
      </div>
    </div>
    <template v-if="showUtc">
      <div class="offset-1">
        <div class="centered-c">UTC{{ offset }}</div>
      </div>
    </template>
    <template v-if="showPrimaryOffset">
      <div v-bind:class="[showUtc ? 'offset-2' : 'offset-1']">
        <div class="centered-c">Pri{{ primaryOffsetString }}</div>
      </div>
    </template>
    <div class="time" v-bind:class="[rowClass]">
      <div><span class="dimmed">{{ shortDayOfTheWeek }}</span> {{ timestring }}</div>
    </div>
    <div v-bind:class="['offset', rowClass]">
      <template v-if="daysOffset !== 0">
        <div v-bind:class="[daysOffset < 0 ? 'redText' : 'greenText']">
          <span v-if="daysOffset > 0">+</span>{{ daysOffset }}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import moment from 'moment-timezone'

export default {
  name: 'Clock',
  props: ['time', 'primaryClock', 'model', 'settings', 'rowClass'],
  model: function () {
    return {

    }
  },
  computed: {
    moment: function () {
      return moment.tz(this.time, this.model.timezone)
    },
    timestring: function () {
      return this.moment.format('HH:mm:ss')
    },
    datestring: function () {
      return this.moment.format('YYYY-MM-DD')
    },
    offset: function () {
      if (this.isUtc) {
        return ''
      } else {
        return this.moment.format('Z')
      }
    },
    commontzname: function () {
      return this.moment.format('zz')
    },
    dayOfTheWeek: function () {
      return this.moment.format('dddd')
    },
    shortDayOfTheWeek: function () {
      return this.moment.format('ddd')
    },
    daysOffset: function () {
      let comparisonPoint = moment.tz(this.primaryClock.timezone)
      if (!comparisonPoint && this.settings.showUtc) {
        comparisonPoint = moment.utc()
      }

      if (comparisonPoint) {
        if (this.moment.year() === comparisonPoint.year()) {
          return this.moment.dayOfYear() - comparisonPoint.dayOfYear()
        } else {
          return this.moment.year() - comparisonPoint.year()
        }
      } else {
        return 0
      }
    },
    displayName: function () {
      return this.model.getDisplayName()
    },
    isUtc: function () {
      return this.model.timezone.toLowerCase() === 'utc'
    },
    isDaylightSavings: function () {
      return this.moment.isDST()
    },
    flagUrl: function () {
      if (this.model.country) {
        return 'static/flags-32/' + this.model.country.toLowerCase() + '.png'
      }
    },
    showPrimaryOffset: function () {
      return this.primaryClock != null && !this.model.primary && !this.isUtc
    },
    showUtc: function () {
      return !this.isUtc && this.settings.showUtc
    },
    primaryOffsetString: function () {
      let diff = this.model.offset - this.primaryClock.offset
      let hours = Math.trunc(Math.abs(diff / 60))
      let minutes = Math.abs(diff) % 60
      let offsetStr = Math.abs(hours) < 10 ? '0' + hours : hours
      if (diff > 0) {
        offsetStr = '+' + offsetStr
      } else if (diff < 0) {
        offsetStr = '-' + offsetStr
      }
      return offsetStr + ':' + (minutes === 0 ? '00' : minutes.toFixed(0))
    }
  },
  methods: {
    fireClickEvent: function () {
      if (!this.isUtc) {
        this.$emit('clock-clicked', this.model.id)
      }
    }
  }
}
</script>

<style>
  div.clock {
    width: 100%;
    display: grid;
    border-bottom: white solid 1px;
    font-size: 1.3rem;
  }
  div.clock.detailed {
    /*padding-bottom: 1%;
    padding-top: 1%;*/
    color: burlywood;
  }
  div.clock-0 {
    grid-template-columns: 5% auto 20% 3%;
  }

  div.clock-1 {
    grid-template-columns: 5% auto 12% 20% 3%;
  }
  div.clock-2{
    grid-template-columns: 5% auto 12% 12% 20% 3%;
  }
  div.flag {
    grid-column: 1 / 2;
    display: grid;
  }
  div.flag > img, span {
    margin: auto;
  }
  div.offset-1 {
    grid-column: 3 / 4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 1.3rem;
  }
  div.offset-2 {
     grid-column: 4 / 5;
     display: flex;
     flex-direction: column;
     justify-content: center;
     font-size: 1.3rem;
  }
  div.time {
    grid-column: 3 / 4;
    text-align: left;
    font-size: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  div.time.clock-0 {
    grid-column: 3 / 4;
  }
  div.time.clock-1 {
    grid-column: 4 / 5;
  }
  div.time.clock-2 {
    grid-column: 5 / 6;
  }

  div.clock-main {
    grid-column: 2 / 3;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  div.clock-name {
    font-size: 1.75rem;
  }
  .clock-details {
    font-size: 1.3rem;
  }
  span.centered-c {
    margin: auto;
  }
  .redText {
    color: red;
  }
  .greenText {
    color: green;
  }
  div.offset {
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: 1.7rem;
  }
  div.offset.clock-0 {
    grid-column: 4 / 5;
  }
  div.offset.clock-1 {
    grid-column: 5 / 6;
  }
  div.offset.clock-2 {
    grid-column: 6 / 7;
  }
  div.time > div {
    text-align: right;
  }
  .dimmed {
    color: #D0D0D0;
  }
  div.detailed .dimmed {
    color: burlywood;
  }
  @media screen and (max-width: 500px) {
    div.clock-0, div.clock-1, div.clock-2 {
      grid-template-columns: 12% auto 40% 5%;
    }
    div.time.clock-0, div.time.clock-1, div.time.clock-2 {
      grid-column: 3 / 4;
    }
    div.offset.clock-0, div.offset.clock-1, div.offset.clock-2 {
      grid-column: 4 / 5;
    }
    div.offset-1, div.offset-2, span.clock-details {
      display: none;
    }
    div.time, div.offset {
      font-size: 1.3rem;
    }
    div.clock, div.clock-name, div.clock-details {
      font-size: 1.1rem;
    }
  }
  @media screen and (max-width: 1024px) and (min-width: 501px) {
    div.clock-0 {
      grid-template-columns: 5% auto 20% 3%;
    }

    div.clock-1 {
      grid-template-columns: 5% auto 12% 20% 3%;
    }
    div.clock-2 {
      grid-template-columns: 5% auto 12% 12% 20% 3%;
    }
  }
</style>
