import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import dts from "rollup-plugin-dts"
import postcss from "rollup-plugin-postcss"
import { terser } from "rollup-plugin-terser"
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import Fs from 'fs/promises'
import del from 'rollup-plugin-delete'

const json = await Fs.readFile('./package.json')
const packageJson = JSON.parse(json)

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: true,
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true,
            },
        ],
        plugins: [
            del({ targets: 'dist/*' }),
            peerDepsExternal(),
            resolve(),
            commonjs(),
            typescript({ tsconfig: "./tsconfig.json" }),
            postcss(),
            terser(),
        ],
    },
    {
        input: "dist/esm/index.d.ts",
        output: [{ file: "dist/index.d.ts", format: "esm" }],
        plugins: [dts()],
        external: [/\.css$/],
    },
]
