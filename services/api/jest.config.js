module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@superapp/types(.*)$': '<rootDir>/../../../packages/types/src$1',
    '^@superapp/validators(.*)$': '<rootDir>/../../../packages/validators/src$1',
    '^@superapp/maps(.*)$': '<rootDir>/../../../packages/maps/src$1',
  },
};
