import {
  generateTypeDefString,
  getConfig,
  getVueComponentFilePaths,
  recursiveListFilePaths
} from '../src/generate'

describe('unit test: generateTypeDefString', () => {
  it('ok', () => {
    expect(
      generateTypeDefString({ out: '', includes: [], excludes: [] }, ['~/components/Dialog.vue'])
    ).toBe(
      `
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    Dialog: typeof import('~/components/Dialog.vue').default;
    LazyDialog: typeof import('~/components/Dialog.vue').default;
  }
}
`.slice(1)
    )
  })

  it('empty', () => {
    expect(generateTypeDefString({ out: '', includes: [], excludes: [] }, [])).toBe(
      `
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
  }
}
`.slice(1)
    )
  })
})

describe('unit test: getVueComponentFilePaths', () => {
  it('no filtering', () => {
    expect(
      getVueComponentFilePaths(
        {
          out: '',
          includes: ['**'],
          excludes: []
        },
        'test/stub'
      )
    ).toEqual([
      'auto-import.d.ts',
      'components/Logo.vue',
      'components/Tag.vue',
      'components/TextBtn.vue',
      'components/dialogs/ConfirmationDialog.vue',
      'components/dialogs/ErrorDialog.vue',
      'vue-gt.yml'
    ])
  })

  it('includes **/*.vue', () => {
    expect(
      getVueComponentFilePaths(
        {
          out: '',
          includes: ['**/*.vue'],
          excludes: []
        },
        'test/stub'
      )
    ).toEqual([
      'components/Logo.vue',
      'components/Tag.vue',
      'components/TextBtn.vue',
      'components/dialogs/ConfirmationDialog.vue',
      'components/dialogs/ErrorDialog.vue'
    ])
  })

  it('excludes **/*.vue', () => {
    expect(
      getVueComponentFilePaths(
        {
          out: '',
          includes: ['**'],
          excludes: ['**/*.vue']
        },
        'test/stub'
      )
    ).toEqual(['auto-import.d.ts', 'vue-gt.yml'])
  })
})

describe('unit test: recursiveListFilePaths', () => {
  it('test/stub', () => {
    expect(recursiveListFilePaths('test/stub')).toEqual([
      'test/stub/auto-import.d.ts',
      'test/stub/components/Logo.vue',
      'test/stub/components/Tag.vue',
      'test/stub/components/TextBtn.vue',
      'test/stub/components/dialogs/ConfirmationDialog.vue',
      'test/stub/components/dialogs/ErrorDialog.vue',
      'test/stub/vue-gt.yml'
    ])
  })

  it('test/stub/components', () => {
    expect(recursiveListFilePaths('test/stub/components')).toEqual([
      'test/stub/components/Logo.vue',
      'test/stub/components/Tag.vue',
      'test/stub/components/TextBtn.vue',
      'test/stub/components/dialogs/ConfirmationDialog.vue',
      'test/stub/components/dialogs/ErrorDialog.vue'
    ])
  })

  it('test/stub/components/dialogs', () => {
    expect(recursiveListFilePaths('test/stub/components/dialogs')).toEqual([
      'test/stub/components/dialogs/ConfirmationDialog.vue',
      'test/stub/components/dialogs/ErrorDialog.vue'
    ])
  })
})

describe('unit test: getConfig', () => {
  it('load test/stub/vue-gt.yml', () => {
    expect(getConfig('test/stub/vue-gt.yml')).toEqual({
      out: 'test/stub/auto-import.d.ts',
      includes: ['**/*.vue'],
      excludes: ['test/stub/components/Logo.vue', 'node_modules']
    })
  })

  it('no config', () => {
    expect(getConfig('test/stub')).toEqual({
      excludes: ['node_modules'],
      includes: ['components/**/*.vue', 'pages/**/*.vue'],
      out: 'auto-import.d.ts'
    })

    expect(getConfig()).toEqual({
      excludes: ['node_modules'],
      includes: ['components/**/*.vue', 'pages/**/*.vue'],
      out: 'auto-import.d.ts'
    })
  })
})