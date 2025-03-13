import pkg from '../../package.json'

const param = {}

param.softwareInfo = {
    name: 'Risqué',
    version: pkg.version || '1.0.0',
    description: '一个强大的调试工具',
    author: pkg.author || 'Cnachen',
    license: pkg.license || 'MIT',
    repository: pkg.repository?.url || 'https://github.com/cnachen/risque',
    homepage: pkg.homepage || 'https://github.com/cnachen/risque',
    dependencies: pkg.dependencies || {}
}

export default param
