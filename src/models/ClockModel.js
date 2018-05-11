import moment from 'moment-timezone'

export default

/**
 * A ClockModel is a pojo around Clock data used for intialising the interface
 * and sorting. It is not intended to hold state, espepially temporal state based
 * on the current moment in time although the id, primary flag and name can be
 * mutated.
 */
class ClockModel { // eslint-disable-line no-unused-vars
  constructor (baseData) {
    this.id = baseData.id
    this.location = baseData.location
    this.country = baseData.country
    this.timezone = baseData.timezone
    this.coordinates = baseData.coordinates
    this.primary = baseData.primary || false
    this.name = baseData.name

    var tzData = moment.tz(this.timezone)
    this.offset = tzData._offset
    this.offsetStr = tzData.format('Z')
  }

  /**
   * Determines what name should be used when displaying this clock's data.
   * @returns {string} the name to be used for this clock in the display.
   */
  getDisplayName () {
    if (this.name && this.name.length > 0) {
      return this.name
    } else if (this.location && this.country) {
      return this.location + ', ' + this.country
    } else if (this.location) {
      return this.location
    } else {
      return this.timezone
    }
  }
}
