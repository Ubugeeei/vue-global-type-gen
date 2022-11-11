import fs from 'fs'
import { parse } from 'yaml'
import wcmatch from 'wildcard-match'

type Config = {
  config: {
    includes?: string[]
    excludes?: string[]
    out?: string
  }
}

export const generate = ({ config: configPath }: { config: string }) => {
  const config = getConfig(configPath)
  const vueFiles = getFiles(config)
  gen(config, vueFiles)
}

const gen = (config: Required<Config['config']>, files: string[]) => {
  const types = files
    .flatMap(it => [
      `\n\x20\x20\x20\x20${it
        .split('/')
        .at(-1)
        ?.replace(/\.vue/, '')}: typeof import('${it}').default;`,
      `\n\x20\x20\x20\x20Lazy${it
        .split('/')
        .at(-1)
        ?.replace(/\.vue/, '')}: typeof import('${it}').default;`
    ])
    .sort(it => (it.match(/Lazy/) ? 1 : -1))
    .join('')

  fs.writeFileSync(
    config.out,
    `declare module '@vue/runtime-core' {\n\x20\x20export interface GlobalComponents {${types}\n\x20\x20}\n}`
  )
}

const getFiles = (config: Required<Config['config']>): string[] =>
  listFiles('.')
    .map(it => it.replace('./', ''))
    .filter(
      name =>
        config.includes.some((it: string) => wcmatch(it)(name)) &&
        config.excludes.every((it: string) => !wcmatch(it)(name))
    )

const getConfig = (configPath?: string): Required<Config['config']> => {
  try {
    const yml = fs.readFileSync(configPath ?? 'vue-gt.yml', 'utf8')
    const { config } = parse(yml) as Config
    const { out, includes, excludes } = config
    return {
      out: out ?? 'auto-import.d.ts',
      includes: includes ?? ['components/**/*.vue', 'pages/**/*.vue'],
      excludes: excludes ? [...excludes, 'node_modules'] : ['node_modules']
    }
  } catch {
    return {
      includes: ['components/**/*.vue', 'pages/**/*.vue'],
      excludes: ['node_modules'],
      out: 'auto-import.d.ts'
    }
  }
}

const listFiles = (dir: string): string[] =>
  fs.statSync(dir).isDirectory()
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap(dirent =>
          dirent.isFile() ? [`${dir}/${dirent.name}`] : listFiles(`${dir}/${dirent.name}`)
        )
    : []
