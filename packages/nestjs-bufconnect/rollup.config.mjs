import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import nodeExternals from 'rollup-plugin-node-externals';

import { options, packageJson } from './rollup-utils/options.mjs';
import { analyze } from './rollup-utils/analyze.mjs';

export default [
  {
    input: options.input,
    output: {
      format: 'cjs',
      dir: options.dir,
      name: 'NestjsBufconnect',
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name].cjs',
    },
    plugins: [
      del({
        targets: options.outputPath,
        hook: 'buildStart',
        verbose: true,
        force: true,
      }),
      nodeResolve({
        preferBuiltins: true,
        extensions: options.fileExtensions,
      }),
      nodeExternals(),
      typescript({
        tsconfig: 'tsconfig.lib.json',
        outDir: '../../dist/packages/nestjs-bufconnect',
        sourceMap: false,
      }),
      commonjs(),
      generatePackageJson({
        additionalDependencies: packageJson.dependencies,
        baseContents: (pkg) => ({
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
          author: pkg.author,
          main: 'index.cjs',
          module: 'index.js',
          types: 'index.d.ts',
          dependencies: packageJson.dependencies,
          peerDependencies: packageJson.peerDependencies,
          license: pkg.license,
          keywords: pkg.keywords,
          files: ['*.js', '*.cjs', '*.d.ts'],
          bugs: pkg.bugs,
          repository: pkg.repository,
        }),
      }),
      copy({
        targets: [
          { src: 'README.md', dest: options.outputPath },
          { src: '../../LICENSE', dest: options.outputPath },
        ],
      }),
      analyze(),
    ],
  },
  {
    input: options.input,
    output: {
      format: 'esm',
      dir: options.dir,
      name: 'NestjsBufconnect',
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
    },
    plugins: [
      nodeResolve({
        preferBuiltins: true,
        extensions: options.fileExtensions,
      }),
      nodeExternals(),
      typescript({
        tsconfig: 'tsconfig.lib.json',
        outDir: '../../dist/packages/nestjs-bufconnect',
        sourceMap: false,
      }),
      commonjs(),
      analyze(),
    ],
  },
  {
    input: options.dts.input,
    output: [{ file: options.dts.output, format: 'es' }],
    plugins: [
      nodeExternals(),
      dts(),
      del({
        targets: options.dts.base,
        hook: 'buildEnd',
        verbose: true,
        force: true,
      }),
    ],
  },
];
