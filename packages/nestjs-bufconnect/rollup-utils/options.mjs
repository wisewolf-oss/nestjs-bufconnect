import { readFileSync } from 'fs';

const options = {
  project: './package.json',
  input: 'src/index.ts',
  dir: '../../dist/packages/nestjs-bufconnect',
  outputPath: '../../dist/packages/nestjs-bufconnect',
  dts: {
    base: '../../dist/packages/nestjs-bufconnect/packages',
    input:
      '../../dist/packages/nestjs-bufconnect/packages/nestjs-bufconnect/src/index.d.ts',
    output: '../../dist/packages/nestjs-bufconnect/index.d.ts',
  },
  assets: {
    src: 'README.md',
    dst: '../../dist/packages/nestjs-bufconnect',
  },
  fileExtensions: ['.ts'],
};

const packageJsonContent = readFileSync('package.json', 'utf-8');
const packageJson = JSON.parse(packageJsonContent);

export { options, packageJson };
