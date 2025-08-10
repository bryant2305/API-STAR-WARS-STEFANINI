// jest.config.js o similar
module.exports = {
  // ... (tu configuración existente: moduleFileExtensions, rootDir, etc.)
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // Añade esta línea para que Jest busque archivos .feature
  testMatch: [
    '**/*.spec.ts',
    '**/*.steps.ts', // Importante para que encuentre los pasos
  ],
  // ... (tu configuración existente: coverageDirectory, testEnvironment)
};