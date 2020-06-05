import Phaser from '../lib/phaser.js'
import Carrot from '../game/Carrot.js'

export default class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.Sprite} */
  player
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors

  constructor(){
    super('game') // unique key for this scene
  }

  preload(){
    this.load.image('background', 'src/assets/bg_layer1.png')
    this.load.image('platform', 'src/assets/ground_grass.png')

    this.load.image('bunny-stand', 'src/assets/bunny1_stand.png')
    this.load.image('bunny-jump', 'src/assets/bunny1_jump.png')

    this.load.image('carrot', 'src/assets/carrot.png')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create(){
    // background
    this.add.image(240, 320, 'background')
      .setScrollFactor(1, 0)

    // platforms
    this.platforms = this.physics.add.staticGroup()

    for (let i = 0; i < 5; ++i){
      const x = Phaser.Math.Between(80, 400)
      const y = 150 * i

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, 'platform')
      platform.scale = .5

      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body
      body.updateFromGameObject()
    }

    // player
    this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
      .setScale(.5)

    this.physics.add.collider(this.platforms, this.player)

    // player collides only with it's bottom
    this.player.body.checkCollision.up = false
    this.player.body.checkCollision.left = false
    this.player.body.checkCollision.right = false

    // camera
    this.cameras.main.startFollow(this.player)

    this.cameras.main.setDeadzone(this.scale.width * 1.5)
  }

  update(){
    // move bottom platforms to top
    this.platforms.children.iterate(child => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child

      const scrollY = this.cameras.main.scrollY
      if (platform.y >= scrollY + 700){
        platform.y = scrollY - Phaser.Math.Between(50, 100)
        platform.body.updateFromGameObject()
      }
    })

    const touchingDown = this.player.body.touching.down
    if (touchingDown){
      this.player.setVelocityY(-300) // player jump straight up
    }

    const { left, right } = this.cursors
    if (left.isDown && !touchingDown){
      this.player.setVelocityX(-200)
    } else if (right.isDown && !touchingDown){
      this.player.setVelocityX(200)
    } else {
      this.player.setVelocityX(0)
    }

    // player wrap
    this.horizontalWrap(this.player)

  }

  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  horizontalWrap(sprite){
    const halfW = sprite.displayWidth / 2,
          gameW = this.scale.width

    if (sprite.x < -halfW){
      sprite.x = gameW + halfW
    } else if (sprite.x > gameW + halfW){
      sprite.x = -halfW
    }
  }
}

