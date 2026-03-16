function generateMapLink(latitude, longitude) {

  if (!latitude || !longitude) {
    return null;
  }

  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

module.exports = generateMapLink;
