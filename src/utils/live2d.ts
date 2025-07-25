// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as PIXI from 'pixi.js'
import { InternalModel, Live2DModel, MotionPriority } from 'pixi-live2d-display'
import { HitAreaFrames } from 'pixi-live2d-display/extra'

interface ModelOption {
  modelJson: string | File[]
  canvasID: string
  autoInteract?: boolean
  containerID: string
  params?: {
    aspectRatio: number
    angle: number
    anchor: {
      x: number
      y: number
    }
  }
}

export class Live2dCreator {
  modelOption: ModelOption
  static model: Live2DModel
  static app: PIXI.Application
  static hitFrames
  json: {
    HitAreas: {
      Name: string
      Id: string
      Motion?: string
    }[]
  }
  constructor(modelOption: ModelOption) {
    window.PIXI = PIXI
    if (window.erosModel) {
      delete window.erosModel
    }
    this.modelOption = modelOption
    console.log(modelOption.modelJson, '1212')
  }

  async initModel(func: () => void) {
    // 引入模型
    // const json = await fetch(this.modelOption.modelJson).then((res) => res.json())
    // console.log(json)
    // this.json = json
    console.log(this.modelOption.modelJson, 'json')
    try {
      const model = await Live2DModel.from(this.modelOption.modelJson, {
        autoInteract: this.modelOption.autoInteract || true
      })
      window.erosModel = model
      this.model = model
      // 创建模型对象
      PIXI.settings.RESOLUTION = 3
      const app = new PIXI.Application({
        view: document.getElementById(this.modelOption.canvasID),
        autoStart: true,
        resizeTo: document.getElementById(this.modelOption.containerID),
        // 透明
        backgroundColor: 0xffffff,
        backgroundAlpha: 0
      })
      this.app = app
      // 添加模型到舞台
      app.stage.addChild(model)
      // 模型的缩放
      this.setScale(this.modelOption?.params?.aspectRatio)
      model.anchor.set(this.modelOption?.params?.anchor.x, this.modelOption?.params?.anchor.y)
      model.scale.set(this.modelOption.params.aspectRatio)
      model.rotation = Math.PI * this.modelOption.params.angle * 2
      // 模型的位置,x,y相较于窗口左上角
      model.x = document.getElementById(this.modelOption.containerID).getBoundingClientRect().width / 2
      model.y = document.getElementById(this.modelOption.containerID).getBoundingClientRect().height / 2

      // // 添加模型状态管理器
      model.InternalModel = new InternalModel(model)
      const hitAreaFrames = new HitAreaFrames()

      model.addChild(hitAreaFrames)

      this.hitFrames = hitAreaFrames
      hitAreaFrames.visible = false
      func()
      console.log(model)
      this.model.internalModel.coreModel.setParameterValueById('Param47', 1)
      this.model.internalModel.coreModel.setParameterValueById('Param54', 1)
      this.model.internalModel.coreModel.setParameterValueById('Param57', 1)
      this.model.internalModel.coreModel.setParameterValueById('Param59', 1)

      this.registerDefaultTap()
    } catch (e) {
      console.warn(e)
    }
  }

  setScale(scale: number) {
    const targetArea =
      document.getElementById(this.modelOption.containerID).getBoundingClientRect().width *
      document.getElementById(this.modelOption.containerID).getBoundingClientRect().height
    const area1 = 375 * 812
    const targetScale = scale * (targetArea / area1)
    window.erosModel.scale.set(targetScale)
    window.erosModel.x = document.getElementById(this.modelOption.canvasID).clientWidth / 2
    window.erosModel.y = document.getElementById(this.modelOption.canvasID).clientHeight / 2
  }

  setAngle(angle: number) {
    window.erosModel.rotation = Math.PI * angle * 2
    window.erosModel.x = document.getElementById(this.modelOption.containerID).getBoundingClientRect().width / 2
    window.erosModel.y = document.getElementById(this.modelOption.containerID).getBoundingClientRect().height / 2
  }

  setAnchor(x: number, y: number) {
    window.erosModel.anchor.set(x, y)
    window.erosModel.x = document.getElementById(this.modelOption.containerID).getBoundingClientRect().width / 2
    window.erosModel.y = document.getElementById(this.modelOption.containerID).getBoundingClientRect().height / 2
  }

  registerHitEvent(func: (hitArea: string[]) => void) {
    try {
      window.erosModel.on('hit', func)
    } catch (e) {
      console.warn(e)
    }
  }
  registerDefaultTap() {
    try {
      window.erosModel.on('pointerdown', () => {
        this.motionTrigger('tap', undefined, MotionPriority.NORMAL)
      })
    } catch (e) {
      console.warn(e)
    }
  }
  setHitAreaFrames(visible: boolean) {
    console.log(visible)
    this.hitFrames.visible = visible
  }
  motionTrigger(type, index = undefined, priority: MotionPriority = MotionPriority.FORCE) {
    return window.erosModel.motion(type, index, priority)
  }

  setParameter() {
    window.erosModel?.setParameterValueById('Param47', 1)
  }

  expressionTrigger(type) {
    window.erosModel.expression(type)
  }
}
