const path = require('path')
const fs = require('fs')
const registry = require('package-stream')()
const exists = require('path-exists').sync
const uniq = require('lodash.uniq')
const rm = require('rimraf').sync
const mkdirp = require('mkdirp')
const fuckups = ['es-snapshot', 'textile-engine']

function emptyDir(name) {
  rm(path.join(__dirname, name))
  mkdirp(path.join(__dirname, name))
}

emptyDir('dependents')
emptyDir('devDependents')

registry
  .on('package', function (pkg) {
    try {
      process.stdout.write('\n' + pkg.name)
      extract(pkg, 'dependencies')
      extract(pkg, 'devDependencies')
    } catch (e) {
      console.error('\n\n\n\n')
      console.error(e)
      console.error('\n\n\n\n')
    }
  })
  .on('up-to-date', function () {
    process.exit()
  })


function extract (pkg, depType) {
  const depNames = depType === 'dependencies' ? pkg.depNames : pkg.devDepNames
  if (!depNames.length) return

  depNames.forEach(depName => {
    const filename = path.join(
      __dirname,
      (depType === 'dependencies' ? 'dependents' : 'devDependents'),
      `${depName}.json`
    )
    let extantDeps = exists(filename) ? require(filename) : []
    extantDeps.push(pkg.name)
    fs.writeFileSync(filename, JSON.stringify(uniq(extantDeps).sort()))
    process.stdout.write(depType === 'dependencies' ? '*' : '@')
  })
}