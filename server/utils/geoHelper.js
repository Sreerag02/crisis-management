/**
 * Formats coordinates into GeoJSON Point object
 * @param {number} lng 
 * @param {number} lat 
 * @returns {Object}
 */
const formatGeoJSON = (lng, lat) => {
  return {
    type: 'Point',
    coordinates: [parseFloat(lng), parseFloat(lat)]
  };
};

module.exports = {
  formatGeoJSON
};
