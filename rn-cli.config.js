const config = {
  /**
   * Returns a regular expression for modules that should be ignored by the
   * packager on a given platform.
   */
  getBlacklistRE() {
    return /_book\//;
  },
};

module.exports = config;
