// This file contains the boilerplate to execute your React app.
// If you want to modify your application's content, start in "index.js"

import {ReactInstance, Surface, Module} from 'react-360-web'

class GameModule extends Module {
  constructor(ctx) {
    super('GameModule')
    this._ctx = ctx
  }

  gameState = {
    currentGameId: '17f764e3-11bc-43af-acd5-f7146fcf47b4',
    userId: 'b508208f-ef60-46c3-8212-a5acd8b7b4b9',
    sign: 'X',
  }
}

function init(bundle, parent, options = {}) {
  const r360 = new ReactInstance(bundle, parent, {
    // Add custom options here
    fullScreen: true,
    nativeModules: [(ctx) => new GameModule(ctx)],
    ...options,
  })

  const myCylinderSurface = new Surface(800, 600, Surface.SurfaceShape.Cylinder)

  // Render your app content to the default cylinder surface
  r360.renderToSurface(
    r360.createRoot('GameBoard', {
      /* initial props */
    }),
    myCylinderSurface,
  )

  const rightSurface = new Surface(800, 600, Surface.SurfaceShape.Flat)
  rightSurface.setAngle(1.2, 0)

  r360.renderToSurface(
    r360.createRoot('VRChatPanel', {
      /* initial props */
    }),
    rightSurface,
  )

  const leftSurface = new Surface(800, 600, Surface.SurfaceShape.Flat)
  leftSurface.setAngle(-0.6, 0)

  r360.renderToSurface(
    r360.createRoot('GameGallery', {
      /* initial props */
    }),
    leftSurface,
  )

  // Load the initial environment
  r360.compositor.setBackground(r360.getAssetURL('360_world.jpg'))
}

window.React360 = {init}
